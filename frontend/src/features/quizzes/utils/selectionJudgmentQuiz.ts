import {
  calculateMoveTypeMultiplier,
  formatTypeMultiplier,
  isMoveEligibleForTypeMatchupQuiz,
} from "@/features/quizzes/utils/typeMatchupQuiz";
import type { MoveMaster } from "@/types/battleMaster";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonCommonMove } from "@/types/pokemonCommonMove";

export type SelectionJudgmentEvaluationStatus =
  | "strong"
  | "neutral"
  | "weak"
  | "unknown";

export type SelectionJudgmentSpeedStatus = "faster" | "same" | "slower";

export type SelectionJudgmentEvaluation = {
  partyPokemon: PartyPokemon;
  pokemon: Pokemon;
  offense: {
    status: SelectionJudgmentEvaluationStatus;
    bestMultiplier: number | null;
    bestMove: MoveMaster | null;
    reason: string;
  };
  defense: {
    status: SelectionJudgmentEvaluationStatus;
    worstMultiplier: number | null;
    worstMove: MoveMaster | null;
    reason: string;
  };
  speed: {
    status: SelectionJudgmentSpeedStatus;
    ownBaseSpeed: number;
    opponentBaseSpeed: number;
    reason: string;
  };
};

const evaluateOffense = (
  partyPokemon: PartyPokemon,
  opponentPokemon: Pokemon,
): SelectionJudgmentEvaluation["offense"] => {
  const moveEvaluations = [
    partyPokemon.move1_master,
    partyPokemon.move2_master,
    partyPokemon.move3_master,
    partyPokemon.move4_master,
  ]
    .filter((move): move is MoveMaster => Boolean(move))
    .filter(isMoveEligibleForTypeMatchupQuiz)
    .map((move) => ({
      move,
      multiplier: calculateMoveTypeMultiplier(move, opponentPokemon.types),
    }));

  if (moveEvaluations.length === 0) {
    return {
      status: "unknown",
      bestMultiplier: null,
      bestMove: null,
      reason:
        "評価可能な攻撃技が登録されていないため、攻撃面は評価していません",
    };
  }

  const bestEvaluation = moveEvaluations.reduce((best, current) =>
    current.multiplier > best.multiplier ? current : best,
  );

  if (bestEvaluation.multiplier >= 2) {
    return {
      status: "strong",
      bestMultiplier: bestEvaluation.multiplier,
      bestMove: bestEvaluation.move,
      reason: `${bestEvaluation.move.name}で${formatTypeMultiplier(bestEvaluation.multiplier)}弱点を突けます`,
    };
  }

  if (bestEvaluation.multiplier === 1) {
    return {
      status: "neutral",
      bestMultiplier: bestEvaluation.multiplier,
      bestMove: bestEvaluation.move,
      reason: `${bestEvaluation.move.name}で等倍で攻撃できます`,
    };
  }

  return {
    status: "weak",
    bestMultiplier: bestEvaluation.multiplier,
    bestMove: bestEvaluation.move,
    reason: "登録されている攻撃技では有効打が乏しいです",
  };
};

const evaluateDefense = (
  ownPokemon: Pokemon,
  opponentCommonMoves: PokemonCommonMove[],
): SelectionJudgmentEvaluation["defense"] => {
  const moveEvaluations = opponentCommonMoves
    .map((commonMove) => commonMove.move_master)
    .filter(isMoveEligibleForTypeMatchupQuiz)
    .map((move) => ({
      move,
      multiplier: calculateMoveTypeMultiplier(move, ownPokemon.types),
    }));

  if (moveEvaluations.length === 0) {
    return {
      status: "unknown",
      worstMultiplier: null,
      worstMove: null,
      reason:
        "相手のよく使われる攻撃技データがないため、防御面は評価していません",
    };
  }

  const worstEvaluation = moveEvaluations.reduce((worst, current) =>
    current.multiplier > worst.multiplier ? current : worst,
  );

  if (worstEvaluation.multiplier <= 0.5) {
    return {
      status: "strong",
      worstMultiplier: worstEvaluation.multiplier,
      worstMove: worstEvaluation.move,
      reason: "相手の主な攻撃技はすべて半減以下で受けられます",
    };
  }

  if (worstEvaluation.multiplier >= 2) {
    return {
      status: "weak",
      worstMultiplier: worstEvaluation.multiplier,
      worstMove: worstEvaluation.move,
      reason: `${worstEvaluation.move.name}で${formatTypeMultiplier(worstEvaluation.multiplier)}弱点を突かれる可能性があります`,
    };
  }

  return {
    status: "neutral",
    worstMultiplier: worstEvaluation.multiplier,
    worstMove: worstEvaluation.move,
    reason: "相手の主な攻撃技に対して大きな弱点はありません",
  };
};

const evaluateSpeed = (
  ownPokemon: Pokemon,
  opponentPokemon: Pokemon,
): SelectionJudgmentEvaluation["speed"] => {
  const ownBaseSpeed = ownPokemon.base_stats.s;
  const opponentBaseSpeed = opponentPokemon.base_stats.s;

  if (ownBaseSpeed > opponentBaseSpeed) {
    return {
      status: "faster",
      ownBaseSpeed,
      opponentBaseSpeed,
      reason: "S種族値が相手より高いです",
    };
  }

  if (ownBaseSpeed === opponentBaseSpeed) {
    return {
      status: "same",
      ownBaseSpeed,
      opponentBaseSpeed,
      reason: "S種族値は相手と同じです",
    };
  }

  return {
    status: "slower",
    ownBaseSpeed,
    opponentBaseSpeed,
    reason: "S種族値は相手の方が高いです",
  };
};

export const createSelectionJudgmentEvaluation = ({
  partyPokemon,
  ownPokemon,
  opponentPokemon,
  opponentCommonMoves,
}: {
  partyPokemon: PartyPokemon;
  ownPokemon: Pokemon;
  opponentPokemon: Pokemon;
  opponentCommonMoves: PokemonCommonMove[];
}): SelectionJudgmentEvaluation => {
  return {
    partyPokemon,
    pokemon: ownPokemon,
    offense: evaluateOffense(partyPokemon, opponentPokemon),
    defense: evaluateDefense(ownPokemon, opponentCommonMoves),
    speed: evaluateSpeed(ownPokemon, opponentPokemon),
  };
};

export type SelectionJudgmentOverallRank =
  | "excellent"
  | "good"
  | "possible"
  | "difficult"
  | "insufficient";

export type SelectionJudgmentOverallEvaluation = {
  rank: SelectionJudgmentOverallRank;
  score: number;
  maxScore: number;
  hasUnknown: boolean;
  reason: string;
};

const getSelectionJudgmentAxisScore = (
  status: SelectionJudgmentEvaluationStatus,
): { score: number; maxScore: number } => {
  if (status === "strong") {
    return { score: 2, maxScore: 2 };
  }

  if (status === "neutral") {
    return { score: 1, maxScore: 2 };
  }

  if (status === "weak") {
    return { score: 0, maxScore: 2 };
  }

  return { score: 0, maxScore: 0 };
};

export const createSelectionJudgmentOverallEvaluation = (
  evaluation: SelectionJudgmentEvaluation,
): SelectionJudgmentOverallEvaluation => {
  const offenseScore = getSelectionJudgmentAxisScore(
    evaluation.offense.status,
  );
  const defenseScore = getSelectionJudgmentAxisScore(
    evaluation.defense.status,
  );
  const speedScore = evaluation.speed.status === "faster" ? 1 : 0;
  const score = offenseScore.score + defenseScore.score + speedScore;
  const maxScore = offenseScore.maxScore + defenseScore.maxScore + 1;
  const hasUnknown =
    evaluation.offense.status === "unknown" ||
    evaluation.defense.status === "unknown";

  if (
    evaluation.offense.status === "unknown" &&
    evaluation.defense.status === "unknown"
  ) {
    return {
      rank: "insufficient",
      score,
      maxScore,
      hasUnknown,
      reason:
        "攻撃面と防御面の評価情報が不足しているため、総合評価できません。",
    };
  }

  let rank: SelectionJudgmentOverallRank;
  let reason: string;

  if (score === 5) {
    rank = "excellent";
    reason = "攻撃面・防御面ともに有利で、素早さでも優位です。";
  } else if (score >= 3) {
    rank = "good";
    reason = "攻撃面または防御面で有利な要素があり、対応しやすいです。";
  } else if (score >= 1) {
    rank = "possible";
    reason = "対応できる要素はありますが、明確な有利とは言えません。";
  } else {
    rank = "difficult";
    reason = "攻撃面・防御面で有利な要素が少なく、対応しづらいです。";
  }

  if (hasUnknown) {
    reason += "一部の評価情報が不足しています。";
  }

  return {
    rank,
    score,
    maxScore,
    hasUnknown,
    reason,
  };
};
