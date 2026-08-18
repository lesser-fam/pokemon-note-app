import { pokemonTypes, type PokemonType } from "@/constants/pokemonTypes";
import { calculateTypeMultiplier } from "@/features/battlePreview/utils/calculateTypeMultiplier";
import {
  createSeededRandom,
  getRandomItem,
} from "@/features/quizzes/utils/quizRandom";
import type { MoveMaster } from "@/types/battleMaster";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

export type TypeMatchupAnswer =
  "super_effective" | "neutral" | "resisted" | "immune";

export type TypeMatchupMoveMode = "rule" | "all";

type TypeMatchupQuizMove = MoveMaster & {
  type: PokemonType;
};

const unsupportedMoveKeys = new Set([
  // 通常のタイプ表とは異なる相性判定を持つ技
  "flying-press",
  "freeze-dry",
  "thousand-arrows",
  // 状況・持ち物・フォーム等で技タイプが変わる技
  "aura-wheel",
  "hidden-power",
  "ivy-cudgel",
  "judgment",
  "multi-attack",
  "natural-gift",
  "raging-bull",
  "revelation-dance",
  "techno-blast",
  "tera-blast",
  "tera-starstorm",
  "terrain-pulse",
  "weather-ball",
  // 通常のタイプ相性を適用しない技
  "struggle",
]);

export const typeMatchupAnswerLabels: Record<TypeMatchupAnswer, string> = {
  super_effective: "抜群以上",
  neutral: "等倍",
  resisted: "半減以下",
  immune: "無効",
};

export type TypeMatchupQuestion = {
  partyPokemon: PartyPokemon;
  pokemon: Pokemon;
  move: TypeMatchupQuizMove;
  multiplier: number;
  correctAnswer: TypeMatchupAnswer;
};

export const isMoveEligibleForTypeMatchupQuiz = (
  move: MoveMaster,
): move is TypeMatchupQuizMove => {
  const isDamagingMove =
    move.damage_class === "physical" || move.damage_class === "special";
  const hasDefinedPower = move.power !== null && move.power > 0;
  const hasSupportedType = (pokemonTypes as readonly string[]).includes(
    move.type,
  );

  return (
    isDamagingMove &&
    hasDefinedPower &&
    hasSupportedType &&
    !unsupportedMoveKeys.has(move.key)
  );
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
  moveList,
  randomSeed,
}: {
  partyPokemonList: PartyPokemon[];
  pokemonList: Pokemon[];
  moveList: MoveMaster[];
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

  const moveCandidates = Array.from(
    new Map(
      moveList
        .filter(isMoveEligibleForTypeMatchupQuiz)
        .map((move) => [move.id, move]),
    ).values(),
  );

  if (ownPokemonCandidates.length === 0 || moveCandidates.length === 0) {
    return null;
  }

  const random = createSeededRandom(randomSeed);
  const ownPokemon = getRandomItem(ownPokemonCandidates, random);
  const move = getRandomItem(moveCandidates, random);
  const multiplier = calculateTypeMultiplier(
    move.type,
    ownPokemon.pokemon.types,
  );

  return {
    ...ownPokemon,
    move,
    multiplier,
    correctAnswer: classifyTypeMultiplier(multiplier),
  };
};
