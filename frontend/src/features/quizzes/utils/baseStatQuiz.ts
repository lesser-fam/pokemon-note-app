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
export type BaseStatQuizMode = "random" | BaseStatKey;
export type BaseStatAnswer = "base" | "comparison" | "same";

export type BaseStatQuizQuestion = {
  basePokemon: Pokemon;
  comparisonPokemon: Pokemon;
  statKey: BaseStatKey;
  statLabel: string;
  correctAnswer: BaseStatAnswer;
};

const getCorrectAnswer = (
  baseStat: number,
  comparisonStat: number,
): BaseStatAnswer => {
  if (baseStat === comparisonStat) {
    return "same";
  }

  return baseStat > comparisonStat ? "base" : "comparison";
};

export const createBaseStatQuizQuestion = ({
  partyPokemonList,
  pokemonList,
  rule,
  randomSeed,
  statMode = "random",
}: {
  partyPokemonList: PartyPokemon[];
  pokemonList: Pokemon[];
  rule: PartyRule;
  randomSeed: number;
  statMode?: BaseStatQuizMode;
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

  if (basePokemonCandidates.length === 0 || availablePokemon.length === 0) {
    return null;
  }

  const random = createSeededRandom(randomSeed);
  const basePokemon = getRandomItem(basePokemonCandidates, random);
  const statCandidates =
    statMode === "random"
      ? shuffleItems(baseStatDefinitions, random)
      : baseStatDefinitions.filter((stat) => stat.key === statMode);

  for (const stat of statCandidates) {
    const comparisonCandidates = availablePokemon.filter(
      (pokemon) =>
        !(
          pokemon.key === basePokemon.key &&
          pokemon.form_key === basePokemon.form_key
        ),
    );

    if (comparisonCandidates.length === 0) {
      continue;
    }

    const comparisonPokemon = getRandomItem(comparisonCandidates, random);
    const baseStat = basePokemon.base_stats[stat.key];
    const comparisonStat = comparisonPokemon.base_stats[stat.key];

    return {
      basePokemon,
      comparisonPokemon,
      statKey: stat.key,
      statLabel: stat.label,
      correctAnswer: getCorrectAnswer(baseStat, comparisonStat),
    };
  }

  return null;
};
