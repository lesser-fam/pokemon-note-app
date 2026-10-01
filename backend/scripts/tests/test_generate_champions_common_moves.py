import importlib.util
import sys
import unittest
from pathlib import Path


SCRIPT_PATH = (
    Path(__file__).resolve().parents[1] / "generate_champions_common_moves.py"
)
SPEC = importlib.util.spec_from_file_location(
    "generate_champions_common_moves",
    SCRIPT_PATH,
)
assert SPEC is not None and SPEC.loader is not None
GENERATOR = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = GENERATOR
SPEC.loader.exec_module(GENERATOR)


class ChampionsCommonMovesGeneratorTest(unittest.TestCase):
    @staticmethod
    def local_move_master(*rows):
        return GENERATOR.build_local_move_master(list(rows))

    @staticmethod
    def move_client(japanese_name="じしん"):
        class MoveClient:
            @staticmethod
            def get(_url, _cache_name):
                return {
                    "name": "earthquake",
                    "names": [
                        {
                            "language": {"name": "ja-Hrkt"},
                            "name": japanese_name,
                        },
                    ],
                }

        return MoveClient()

    def test_select_move_rows_filters_threshold_and_keeps_rank_order(self):
        rows = [
            {
                "position": 1,
                "category": "move",
                "rank": 2,
                "name": "Five Percent",
                "percentage_value": 5.0,
            },
            {
                "position": 1,
                "category": "move",
                "rank": 1,
                "name": "Ten Percent",
                "percentage_value": 10.0,
            },
            {
                "position": 1,
                "category": "move",
                "rank": 3,
                "name": "Under Threshold",
                "percentage_value": 4.9,
            },
            {
                "position": 1,
                "category": "ability",
                "rank": 1,
                "name": "Not A Move",
                "percentage_value": 99.0,
            },
        ]

        selected = GENERATOR.select_move_rows(rows)

        self.assertEqual(
            [row["name"] for row in selected],
            ["Ten Percent", "Five Percent"],
        )

    def test_select_move_rows_limits_to_top_fifteen(self):
        rows = [
            {
                "position": 1,
                "category": "move",
                "rank": index,
                "name": f"Move {index}",
                "percentage_value": 5.0,
            }
            for index in range(1, 17)
        ]

        selected = GENERATOR.select_move_rows(rows)

        self.assertEqual(len(selected), 15)
        self.assertEqual(selected[-1]["name"], "Move 15")

    def test_move_normalization_uses_pokeapi_keys(self):
        self.assertEqual(GENERATOR.normalize_move_name("Earthquake"), "earthquake")
        self.assertEqual(GENERATOR.normalize_move_name("Draco Meteor"), "draco-meteor")
        self.assertEqual(GENERATOR.normalize_move_name("Stealth Rock"), "stealth-rock")
        self.assertEqual(GENERATOR.normalize_move_name("King's Shield"), "kings-shield")

    def test_move_mapping_requires_matching_local_master_move(self):
        master = self.local_move_master({"key": "earthquake", "name": "じしん"})

        name = GENERATOR.map_move_name(
            "Earthquake",
            self.move_client(),
            {},
            master,
        )

        self.assertEqual(name, "じしん")

    def test_move_mapping_fails_when_local_master_key_is_missing(self):
        master = self.local_move_master({"key": "tackle", "name": "たいあたり"})

        with self.assertRaises(GENERATOR.GeneratorError):
            GENERATOR.map_move_name("Earthquake", self.move_client(), {}, master)

    def test_local_master_duplicate_key_is_fatal(self):
        with self.assertRaises(GENERATOR.GeneratorError):
            self.local_move_master(
                {"key": "earthquake", "name": "じしん"},
                {"key": "earthquake", "name": "じしん"},
            )

    def test_move_mapping_fails_for_ambiguous_seeder_name(self):
        master = self.local_move_master(
            {"key": "earthquake", "name": "じしん"},
            {"key": "other-move", "name": "じしん"},
        )

        with self.assertRaises(GENERATOR.GeneratorError):
            GENERATOR.map_move_name("Earthquake", self.move_client(), {}, master)

    def test_move_mapping_fails_when_pokeapi_name_differs_from_local_master(self):
        master = self.local_move_master({"key": "earthquake", "name": "じならし"})

        with self.assertRaises(GENERATOR.GeneratorError):
            GENERATOR.map_move_name("Earthquake", self.move_client(), {}, master)

    def test_pokemon_mapping_handles_default_and_special_forms(self):
        index = {
            "pokemon": [
                {"showdownId": "garchomp"},
                {"showdownId": "basculegionf"},
            ],
        }

        targets = GENERATOR.map_pokemon_targets(
            ["garchomp:default", "basculegion:female"],
            index,
            {"basculegion:female": "basculegionf"},
        )

        self.assertEqual(
            [target.showdown_id for target in targets],
            ["garchomp", "basculegionf"],
        )

    def test_duplicate_move_is_fatal(self):
        rows = [
            {
                "position": 1,
                "category": "move",
                "rank": 1,
                "name": "Earthquake",
                "percentage_value": 10.0,
            },
            {
                "position": 1,
                "category": "move",
                "rank": 2,
                "name": "Earthquake",
                "percentage_value": 9.0,
            },
        ]

        with self.assertRaises(GENERATOR.GeneratorError):
            GENERATOR.select_move_rows(rows)

    def test_diff_report_includes_counts_added_and_removed_moves(self):
        target = GENERATOR.PokemonTarget(
            identifier="garchomp:default",
            pokemon_key="garchomp",
            form_key="default",
            showdown_id="garchomp",
        )
        candidate = GENERATOR.CandidateMove(
            target=target,
            move_name="Draco Meteor",
            percentage_value=10.0,
            rank=1,
            position=1,
            master_name="りゅうせいぐん",
        )

        report, summary = GENERATOR.build_diff_report(
            [target],
            [candidate],
            {"garchomp:default": ["じしん"]},
            [],
        )

        self.assertIn("old_count: 1", report)
        self.assertIn("new_count: 1", report)
        self.assertIn("- りゅうせいぐん", report)
        self.assertIn("- じしん", report)
        self.assertEqual(summary["added_move_rows"], 1)
        self.assertEqual(summary["removed_move_rows"], 1)

    def test_invalid_pokemon_mapping_is_fatal(self):
        with self.assertRaises(GENERATOR.GeneratorError):
            GENERATOR.map_pokemon_targets(
                ["garchomp:default"],
                {"pokemon": []},
                {},
            )


if __name__ == "__main__":
    unittest.main()
