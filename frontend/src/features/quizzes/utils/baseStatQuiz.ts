import { isPokemonAvailableForRule } from "@/features/pokemonRules/isPokemonAvailableForRule";
import {
  createSeededRandom,
  getRandomItem,
  shuffleItems,
} from "@/features/quizzes/utils/quizRandom";
import type { PartyPokemon, PartyRule } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

export const baseStatDefinitions = [
  { key: "h", label: "HP" },
  { key: "a", label: "攻撃" },
  { key: "b", label: "防御" },
  { key: "c", label: "特攻" },
  { key: "d", label: "特防" },
  { key: "s", label: "素早さ" },
] as const;

export type BaseStatKey = (typeof baseStatDefinitions)[number]["key"];
export type BaseStatAnswer = "base" | "comparison";

export type BaseStatQuizQuestion = {
  basePokemon: Pokemon;
  comparisonPokemon: Pokemon;
  statKey: BaseStatKey;
  statLabel: string;
  correctAnswer: BaseStatAnswer;
};

export const createBaseStatQuizQuestion = ({
  partyPokemonList,
  pokemonList,
  rule,
  randomSeed,
}: {
  partyPokemonList: PartyPokemon[];
  pokemonList: Pokemon[];
  rule: PartyRule;
  randomSeed: number;
}): BaseStatQuizQuestion | null => {
  const basePokemonCandidates = partyPokemonList
    .map((partyPokemon) =>
      pokemonList.find(
        (pokemon) =>
          pokemon.key === partyPokemon.pokemon_key &&
          pokemon.form_key === partyPokemon.form_key,
      ),
    )
    .filter((pokemon): pokemon is Pokemon => Boolean(pokemon));

  const availablePokemon = pokemonList.filter((pokemon) =>
    isPokemonAvailableForRule(pokemon, rule),
  );

  if (basePokemonCandidates.length === 0 || availablePokemon.length < 2) {
    return null;
  }

  const random = createSeededRandom(randomSeed);
  const basePokemon = getRandomItem(basePokemonCandidates, random);
  const statCandidates = shuffleItems(baseStatDefinitions, random);

  for (const stat of statCandidates) {
    const comparisonCandidates = availablePokemon.filter(
      (pokemon) =>
        pokemon.key !== basePokemon.key &&
        pokemon.base_stats[stat.key] !== basePokemon.base_stats[stat.key],
    );

    if (comparisonCandidates.length === 0) {
      continue;
    }

    const comparisonPokemon = getRandomItem(comparisonCandidates, random);

    return {
      basePokemon,
      comparisonPokemon,
      statKey: stat.key,
      statLabel: stat.label,
      correctAnswer:
        basePokemon.base_stats[stat.key] >
        comparisonPokemon.base_stats[stat.key]
          ? "base"
          : "comparison",
    };
  }

  return null;
};
