#!/usr/bin/env python3
"""Generate a review-only Champions common-moves candidate CSV.

The official CSV is deliberately never written by this tool. Review the
candidate and diff report before manually deciding whether to replace it.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import time
import unicodedata
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[2]
CHAMPIONS_API_URL = "https://championsbattledata.com/api"
POKEAPI_MOVE_URL = "https://pokeapi.co/api/v2/move"
EXPECTED_CSV_HEADER = [
    "rule",
    "pokemon_key",
    "form_key",
    "move_name",
    "memo",
]
MIN_PERCENTAGE = 5.0
# Current Singles currently provides the top 10 move rows. Keep this higher cap
# as a safety guard if the external API expands the response in the future.
MAX_MOVES_PER_POKEMON = 15


class GeneratorError(RuntimeError):
    """A fatal condition that must prevent candidate CSV creation."""


@dataclass(frozen=True)
class PokemonTarget:
    identifier: str
    pokemon_key: str
    form_key: str
    showdown_id: str


@dataclass(frozen=True)
class CandidateMove:
    target: PokemonTarget
    move_name: str
    percentage_value: float
    rank: int
    position: int
    master_name: str


@dataclass(frozen=True)
class LocalMoveMaster:
    names_by_key: dict[str, str]
    key_count_by_name: dict[str, int]


class JsonClient:
    def __init__(
        self,
        cache_directory: Path,
        request_delay: float,
        refresh_cache: bool,
    ) -> None:
        self.cache_directory = cache_directory
        self.request_delay = request_delay
        self.refresh_cache = refresh_cache

    def get(self, url: str, cache_name: str) -> dict[str, Any]:
        cache_path = self.cache_directory / cache_name

        if cache_path.exists() and not self.refresh_cache:
            return self._read_json(cache_path, f"cache {cache_path}")

        request = Request(url, headers={"User-Agent": "MatchupNoteCandidateGenerator/1.0"})

        try:
            with urlopen(request, timeout=30) as response:
                if response.status != 200:
                    raise GeneratorError(f"HTTP {response.status}: {url}")

                body = response.read()
        except (HTTPError, URLError, TimeoutError) as error:
            raise GeneratorError(f"API request failed: {url}: {error}") from error

        try:
            payload = json.loads(body)
        except json.JSONDecodeError as error:
            raise GeneratorError(f"JSON parse failed: {url}: {error}") from error

        if not isinstance(payload, dict):
            raise GeneratorError(f"API schema is invalid: {url} did not return an object")

        cache_path.parent.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        time.sleep(self.request_delay)

        return payload

    @staticmethod
    def _read_json(path: Path, source: str) -> dict[str, Any]:
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise GeneratorError(f"JSON parse failed for {source}: {error}") from error

        if not isinstance(payload, dict):
            raise GeneratorError(f"API schema is invalid: {source} did not contain an object")

        return payload


def read_json_object(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise GeneratorError(f"Could not read {path}: {error}") from error

    if not isinstance(payload, dict):
        raise GeneratorError(f"{path} must contain a JSON object")

    return payload


def load_champions_identifiers(path: Path) -> list[str]:
    source = read_json_object(path)
    identifiers: list[str] = []

    for key in ("mA", "mBAdded", "mCAdded"):
        values = source.get(key)
        if not isinstance(values, list) or not all(isinstance(value, str) for value in values):
            raise GeneratorError(f"{path}: {key} must be an array of identifiers")

        identifiers.extend(values)

    if len(identifiers) != len(set(identifiers)):
        raise GeneratorError("Champions identifier source contains duplicates")

    for identifier in identifiers:
        if identifier.count(":") != 1:
            raise GeneratorError(f"Invalid Champions identifier: {identifier}")

    return identifiers


def load_showdown_id_overrides(path: Path) -> dict[str, str]:
    overrides = read_json_object(path)

    if not all(
        isinstance(identifier, str) and isinstance(showdown_id, str)
        for identifier, showdown_id in overrides.items()
    ):
        raise GeneratorError(f"{path} must map identifiers to Showdown IDs")

    return overrides


def default_showdown_id(identifier: str) -> str:
    pokemon_key, form_key = identifier.split(":")
    value = pokemon_key if form_key == "default" else f"{pokemon_key}{form_key}"
    return value.replace("-", "")


def map_pokemon_targets(
    identifiers: list[str],
    index: dict[str, Any],
    overrides: dict[str, str],
) -> list[PokemonTarget]:
    pokemon_rows = index.get("pokemon")
    if not isinstance(pokemon_rows, list):
        raise GeneratorError("API index schema is invalid: pokemon is not an array")

    available_ids: set[str] = set()

    for row in pokemon_rows:
        if not isinstance(row, dict) or not isinstance(row.get("showdownId"), str):
            raise GeneratorError("API index schema is invalid: pokemon[].showdownId is missing")

        showdown_id = row["showdownId"]
        if showdown_id in available_ids:
            raise GeneratorError(f"API index has ambiguous Showdown ID: {showdown_id}")

        available_ids.add(showdown_id)

    unknown_override_identifiers = set(overrides) - set(identifiers)
    if unknown_override_identifiers:
        raise GeneratorError(
            "Showdown ID overrides include non-Champions identifiers: "
            + ", ".join(sorted(unknown_override_identifiers)),
        )

    targets: list[PokemonTarget] = []

    for identifier in identifiers:
        pokemon_key, form_key = identifier.split(":")
        showdown_id = overrides.get(identifier, default_showdown_id(identifier))

        if showdown_id not in available_ids:
            raise GeneratorError(
                f"Champions Pokemon mapping failed: {identifier} -> {showdown_id} "
                "does not exist in the API index",
            )

        targets.append(
            PokemonTarget(
                identifier=identifier,
                pokemon_key=pokemon_key,
                form_key=form_key,
                showdown_id=showdown_id,
            ),
        )

    return targets


def normalize_move_name(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name)
    normalized = normalized.replace("’", "'").replace("♀", "f").replace("♂", "m")
    normalized = normalized.encode("ascii", "ignore").decode("ascii").lower()
    normalized = normalized.replace("'", "")
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")

    if not normalized:
        raise GeneratorError(f"Move name cannot be normalized: {name!r}")

    return normalized


def get_localized_move_name(move: dict[str, Any], fallback: str) -> str:
    names = move.get("names")
    if not isinstance(names, list):
        raise GeneratorError(f"Move master schema is invalid for {fallback}: names")

    for language_name in ("ja-Hrkt", "ja", "en"):
        for entry in names:
            if not isinstance(entry, dict):
                continue

            language = entry.get("language")
            localized_name = entry.get("name")

            if (
                isinstance(language, dict)
                and language.get("name") == language_name
                and isinstance(localized_name, str)
                and localized_name.strip()
            ):
                return localized_name.strip()

    raise GeneratorError(f"Move master mapping failed: {fallback} has no localized name")


def build_local_move_master(rows: Any) -> LocalMoveMaster:
    if not isinstance(rows, list):
        raise GeneratorError("Local Move master schema is invalid: data is not an array")

    names_by_key: dict[str, str] = {}
    key_count_by_name: dict[str, int] = defaultdict(int)
    for row in rows:
        if not isinstance(row, dict):
            raise GeneratorError("Local Move master schema is invalid: a move is not an object")

        move_key = row.get("key")
        move_name = row.get("name")
        if not isinstance(move_key, str) or not isinstance(move_name, str):
            raise GeneratorError("Local Move master schema is invalid: key or name is missing")
        if move_key in names_by_key:
            raise GeneratorError(f"Local Move master has an ambiguous key: {move_key}")

        names_by_key[move_key] = move_name
        key_count_by_name[move_name] += 1

    if not names_by_key:
        raise GeneratorError("Local Move master is empty")

    return LocalMoveMaster(
        names_by_key=names_by_key,
        key_count_by_name=dict(key_count_by_name),
    )


def load_local_move_master(url: str) -> LocalMoveMaster:
    parsed_url = urlparse(url)
    if parsed_url.hostname not in {"127.0.0.1", "localhost", "::1"}:
        raise GeneratorError("Local Move master URL must use a loopback host")

    request = Request(url, headers={"User-Agent": "MatchupNoteCandidateGenerator/1.0"})
    try:
        with urlopen(request, timeout=30) as response:
            payload = json.loads(response.read())
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
        raise GeneratorError(f"Local Move master request failed: {error}") from error

    return build_local_move_master(payload.get("data") if isinstance(payload, dict) else None)


def map_move_name(
    external_name: str,
    client: JsonClient,
    mapped_moves: dict[str, str],
    local_move_master: LocalMoveMaster,
) -> str:
    if external_name in mapped_moves:
        return mapped_moves[external_name]

    move_key = normalize_move_name(external_name)
    move = client.get(
        f"{POKEAPI_MOVE_URL}/{quote(move_key)}/",
        f"moves/{move_key}.json",
    )

    if move.get("name") != move_key:
        raise GeneratorError(
            f"Move master mapping failed: {external_name} -> {move_key} was not exact",
        )

    pokeapi_name = get_localized_move_name(move, move_key)
    local_name = local_move_master.names_by_key.get(move_key)
    if local_name is None:
        raise GeneratorError(f"Local Move master mapping failed: missing key {move_key}")
    if local_name != pokeapi_name:
        raise GeneratorError(
            "Local Move master mapping failed: "
            f"{move_key} name differs ({local_name} != {pokeapi_name})",
        )
    if local_move_master.key_count_by_name.get(local_name) != 1:
        raise GeneratorError(
            f"Local Move master mapping failed: ambiguous Seeder name {local_name}",
        )

    mapped_moves[external_name] = local_name

    return mapped_moves[external_name]


def get_move_position(row: dict[str, Any]) -> int:
    position = row.get("position", row.get("column_position"))
    if not isinstance(position, int):
        raise GeneratorError("Battle API schema is invalid: move row position is missing")

    return position


def select_move_rows(rows: Any) -> list[dict[str, Any]]:
    if not isinstance(rows, list):
        raise GeneratorError("Battle API schema is invalid: rows is not an array")

    selected_rows: list[dict[str, Any]] = []

    for row in rows:
        if not isinstance(row, dict):
            raise GeneratorError("Battle API schema is invalid: a row is not an object")

        if row.get("category") != "move":
            continue

        required = ("rank", "name", "percentage_value")
        if any(key not in row for key in required):
            raise GeneratorError("Battle API schema is invalid: move row fields are missing")

        percentage = row["percentage_value"]
        rank = row["rank"]
        position = get_move_position(row)
        name = row["name"]

        if (
            not isinstance(percentage, (int, float))
            or not isinstance(rank, int)
            or not isinstance(position, int)
            or not isinstance(name, str)
        ):
            raise GeneratorError("Battle API schema is invalid: move row fields are invalid")

        if percentage >= MIN_PERCENTAGE:
            selected_rows.append(row)

    selected_rows.sort(
        key=lambda row: (row["rank"], get_move_position(row), row["name"]),
    )

    seen_names: set[str] = set()
    for row in selected_rows:
        if row["name"] in seen_names:
            raise GeneratorError(f"Duplicate move in one Pokemon response: {row['name']}")

        seen_names.add(row["name"])

    return selected_rows[:MAX_MOVES_PER_POKEMON]


def validate_battle_response(
    response: dict[str, Any],
    target: PokemonTarget,
) -> list[dict[str, Any]]:
    required = ("pokemon", "showdownId", "format", "season", "rows")
    if any(key not in response for key in required):
        raise GeneratorError(f"Battle API schema is invalid for {target.identifier}")

    if response["showdownId"] != target.showdown_id:
        raise GeneratorError(
            f"Battle API returned an unexpected Showdown ID for {target.identifier}",
        )

    if response["format"] != "Singles" or response["season"] != "Current":
        raise GeneratorError(
            f"Battle API returned non-Current Singles data for {target.identifier}",
        )

    rows = response["rows"]
    if not isinstance(rows, list) or not rows:
        raise GeneratorError(
            f"Battle API returned no rows for {target.identifier}; refusing to infer no moves",
        )

    return select_move_rows(rows)


def read_existing_csv(path: Path) -> dict[str, list[str]]:
    try:
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.reader(handle)
            header = next(reader, None)

            if header != EXPECTED_CSV_HEADER:
                raise GeneratorError(f"Official CSV has an invalid header: {path}")

            moves_by_identifier: dict[str, list[str]] = defaultdict(list)
            for row in reader:
                if not row:
                    continue

                values = (row + [""] * len(EXPECTED_CSV_HEADER))[: len(EXPECTED_CSV_HEADER)]
                rule, pokemon_key, form_key, move_name, _memo = [value.strip() for value in values]

                if rule != "champions" or not pokemon_key or not form_key or not move_name:
                    raise GeneratorError(f"Official CSV has an invalid row: {row}")

                moves_by_identifier[f"{pokemon_key}:{form_key}"].append(move_name)
    except OSError as error:
        raise GeneratorError(f"Could not read official CSV: {error}") from error

    return dict(moves_by_identifier)


def validate_candidate_rows(rows: list[CandidateMove]) -> None:
    if not rows:
        raise GeneratorError("Candidate CSV validation failed: no candidate rows")

    moves_by_identifier: dict[str, list[CandidateMove]] = defaultdict(list)
    for row in rows:
        moves_by_identifier[row.target.identifier].append(row)

    for identifier, moves in moves_by_identifier.items():
        if len(moves) > MAX_MOVES_PER_POKEMON:
            raise GeneratorError(f"Candidate CSV validation failed: {identifier} has over 15 moves")

        names = [move.master_name for move in moves]
        if len(names) != len(set(names)):
            raise GeneratorError(f"Candidate CSV validation failed: duplicate move for {identifier}")

        if any(move.percentage_value < MIN_PERCENTAGE for move in moves):
            raise GeneratorError(f"Candidate CSV validation failed: under-threshold move for {identifier}")


def build_diff_report(
    targets: list[PokemonTarget],
    candidate_rows: list[CandidateMove],
    existing_rows: dict[str, list[str]],
    warnings: list[str],
) -> tuple[str, dict[str, int]]:
    candidate_by_identifier: dict[str, list[str]] = defaultdict(list)
    for row in candidate_rows:
        candidate_by_identifier[row.target.identifier].append(row.master_name)

    all_identifiers = [target.identifier for target in targets]
    changed_identifiers = [
        identifier
        for identifier in all_identifiers
        if existing_rows.get(identifier, []) != candidate_by_identifier.get(identifier, [])
    ]
    added_count = sum(
        len(set(candidate_by_identifier.get(identifier, [])) - set(existing_rows.get(identifier, [])))
        for identifier in all_identifiers
    )
    removed_count = sum(
        len(set(existing_rows.get(identifier, [])) - set(candidate_by_identifier.get(identifier, [])))
        for identifier in all_identifiers
    )

    lines = [
        "# Pokémon Champions common moves candidate diff",
        "",
        f"- target pokemon/forms: {len(all_identifiers)}",
        f"- candidate pokemon/forms: {len(candidate_by_identifier)}",
        f"- old rows: {sum(len(moves) for moves in existing_rows.values())}",
        f"- candidate rows: {len(candidate_rows)}",
        f"- changed pokemon/forms: {len(changed_identifiers)}",
        f"- added move rows: {added_count}",
        f"- removed move rows: {removed_count}",
        f"- warnings: {len(warnings)}",
    ]

    if warnings:
        lines.extend(["", "## Warnings", ""])
        lines.extend(f"- {warning}" for warning in warnings)

    for identifier in changed_identifiers:
        old_moves = existing_rows.get(identifier, [])
        new_moves = candidate_by_identifier.get(identifier, [])
        added = [move for move in new_moves if move not in old_moves]
        removed = [move for move in old_moves if move not in new_moves]

        lines.extend(
            [
                "",
                f"## {identifier}",
                "",
                f"old_count: {len(old_moves)}",
                f"new_count: {len(new_moves)}",
                "",
                "Added",
            ],
        )
        lines.extend(f"- {move}" for move in added or ["(none)"])
        lines.extend(["", "Removed"])
        lines.extend(f"- {move}" for move in removed or ["(none)"])

    return "\n".join(lines) + "\n", {
        "changed_pokemon_forms": len(changed_identifiers),
        "added_move_rows": added_count,
        "removed_move_rows": removed_count,
    }


def write_candidate_csv(path: Path, rows: list[CandidateMove]) -> None:
    temporary_path = path.with_suffix(path.suffix + ".tmp")
    with temporary_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(EXPECTED_CSV_HEADER)

        for row in rows:
            writer.writerow(
                [
                    "champions",
                    row.target.pokemon_key,
                    row.target.form_key,
                    row.master_name,
                    "",
                ],
            )

    temporary_path.replace(path)


def generate(args: argparse.Namespace) -> dict[str, int]:
    identifiers = load_champions_identifiers(args.identifiers)
    overrides = load_showdown_id_overrides(args.overrides)
    client = JsonClient(args.cache_directory, args.request_delay, args.refresh_cache)
    index = client.get(CHAMPIONS_API_URL, "champions-index.json")
    targets = map_pokemon_targets(identifiers, index, overrides)
    local_move_master = load_local_move_master(args.move_master_url)
    existing_rows = read_existing_csv(args.official_csv)
    warnings: list[str] = []
    candidate_rows: list[CandidateMove] = []
    mapped_moves: dict[str, str] = {}
    api_success_ids: set[str] = set()

    for target in targets:
        response = client.get(
            f"{CHAMPIONS_API_URL}/battle/Singles/{quote(target.showdown_id)}",
            f"singles/{target.showdown_id}.json",
        )
        selected_rows = validate_battle_response(response, target)
        api_success_ids.add(target.showdown_id)

        all_move_rows = [
            row
            for row in response["rows"]
            if isinstance(row, dict)
            and row.get("category") == "move"
            and isinstance(row.get("percentage_value"), (int, float))
            and row["percentage_value"] >= MIN_PERCENTAGE
        ]
        if not selected_rows:
            warnings.append(f"{target.identifier}: no move is at least {MIN_PERCENTAGE}%")
        if len(all_move_rows) > MAX_MOVES_PER_POKEMON:
            warnings.append(f"{target.identifier}: 15-move limit applied")
        old_count = len(existing_rows.get(target.identifier, []))
        if old_count and len(selected_rows) * 2 <= old_count:
            warnings.append(
                f"{target.identifier}: move count decreased from {old_count} to {len(selected_rows)}",
            )

        for row in selected_rows:
            master_name = map_move_name(
                row["name"],
                client,
                mapped_moves,
                local_move_master,
            )
            candidate_rows.append(
                CandidateMove(
                    target=target,
                    move_name=row["name"],
                    percentage_value=float(row["percentage_value"]),
                    rank=row["rank"],
                    position=get_move_position(row),
                    master_name=master_name,
                ),
            )

    validate_candidate_rows(candidate_rows)
    report, diff_summary = build_diff_report(targets, candidate_rows, existing_rows, warnings)

    args.output_directory.mkdir(parents=True, exist_ok=True)
    write_candidate_csv(args.output_directory / "pokemon_common_moves_champions.candidate.csv", candidate_rows)
    (args.output_directory / "pokemon_common_moves_champions.diff.md").write_text(
        report,
        encoding="utf-8",
    )

    return {
        "target_pokemon_forms": len(targets),
        "pokemon_mapping_successes": len(targets),
        "api_request_successes": len(api_success_ids),
        "selected_moves": len(candidate_rows),
        "unique_external_moves": len(mapped_moves),
        "local_master_mapped_moves": len(mapped_moves),
        "missing_moves": 0,
        "ambiguous_moves": 0,
        "candidate_rows": len(candidate_rows),
        "candidate_pokemon_forms": len({row.target.identifier for row in candidate_rows}),
        "zero_move_warnings": sum("no move is at least" in warning for warning in warnings),
        "limit_warnings": sum("15-move limit" in warning for warning in warnings),
        "warning_count": len(warnings),
        **diff_summary,
    }


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a review-only Champions common-moves candidate CSV.",
    )
    parser.add_argument(
        "--identifiers",
        type=Path,
        default=PROJECT_ROOT / "frontend/src/features/pokemonRules/championsRegulations.json",
    )
    parser.add_argument(
        "--overrides",
        type=Path,
        default=PROJECT_ROOT / "backend/scripts/champions_showdown_id_overrides.json",
    )
    parser.add_argument(
        "--official-csv",
        type=Path,
        default=PROJECT_ROOT / "backend/storage/app/data/pokemon_common_moves_champions.csv",
    )
    parser.add_argument(
        "--output-directory",
        type=Path,
        default=PROJECT_ROOT / "backend/storage/app/data/generated",
    )
    parser.add_argument(
        "--cache-directory",
        type=Path,
        default=PROJECT_ROOT / "backend/storage/app/data/generated/champions-api-cache",
    )
    parser.add_argument(
        "--move-master-url",
        default="http://127.0.0.1:8081/api/moves?all=true",
        help="Loopback-only Laravel Move API used for read-only local master validation.",
    )
    parser.add_argument("--request-delay", type=float, default=0.05)
    parser.add_argument("--refresh-cache", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_arguments()

    try:
        summary = generate(args)
    except GeneratorError as error:
        print(f"Fatal: {error}", file=sys.stderr)
        return 1

    for key, value in summary.items():
        print(f"{key}: {value}")

    print(f"candidate_csv: {args.output_directory / 'pokemon_common_moves_champions.candidate.csv'}")
    print(f"diff_report: {args.output_directory / 'pokemon_common_moves_champions.diff.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
