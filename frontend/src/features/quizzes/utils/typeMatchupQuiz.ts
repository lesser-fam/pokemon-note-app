import { pokemonTypes, type PokemonType } from "@/constants/pokemonTypes";
import { calculateTypeMultiplier } from "@/features/battlePreview/utils/calculateTypeMultiplier";
import {
  createSeededRandom,
  getRandomItem,
} from "@/features/quizzes/utils/quizRandom";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

export type TypeMatchupAnswer =
  "super_effective" | "neutral" | "resisted" | "immune";

export const typeMatchupAnswerLabels: Record<TypeMatchupAnswer, string> = {
  super_effective: "抜群以上",
  neutral: "等倍",
  resisted: "半減以下",
  immune: "無効",
};

export type TypeMatchupQuestion = {
  partyPokemon: PartyPokemon;
  pokemon: Pokemon;
  attackType: PokemonType;
  multiplier: number;
  correctAnswer: TypeMatchupAnswer;
};

export const classifyTypeMultiplier = (
  multiplier: number,
): TypeMatchupAnswer => {
  if (multiplier === 0) {
    return "immune";
  }

  if (multiplier > 1) {
    return "super_effective";
  }

  if (multiplier === 1) {
    return "neutral";
  }

  return "resisted";
};

export const formatTypeMultiplier = (multiplier: number): string => {
  if (multiplier === 0.25) {
    return "1/4倍";
  }

  if (multiplier === 0.5) {
    return "1/2倍";
  }

  return `${multiplier}倍`;
};

export const createTypeMatchupQuestion = ({
  partyPokemonList,
  pokemonList,
  randomSeed,
}: {
  partyPokemonList: PartyPokemon[];
  pokemonList: Pokemon[];
  randomSeed: number;
}): TypeMatchupQuestion | null => {
  const ownPokemonCandidates = partyPokemonList
    .map((partyPokemon) => {
      const pokemon = pokemonList.find(
        (master) =>
          master.key === partyPokemon.pokemon_key &&
          master.form_key === partyPokemon.form_key,
      );

      return pokemon ? { partyPokemon, pokemon } : null;
    })
    .filter(
      (
        candidate,
      ): candidate is {
        partyPokemon: PartyPokemon;
        pokemon: Pokemon;
      } => Boolean(candidate),
    );

  if (ownPokemonCandidates.length === 0) {
    return null;
  }

  const random = createSeededRandom(randomSeed);
  const ownPokemon = getRandomItem(ownPokemonCandidates, random);
  const attackType = getRandomItem(pokemonTypes, random);
  const multiplier = calculateTypeMultiplier(
    attackType,
    ownPokemon.pokemon.types,
  );

  return {
    ...ownPokemon,
    attackType,
    multiplier,
    correctAnswer: classifyTypeMultiplier(multiplier),
  };
};
