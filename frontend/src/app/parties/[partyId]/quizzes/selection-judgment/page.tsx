"use client";

import { AppHeader } from "@/components/AppHeader";
import { PageStateMessage } from "@/components/pageStates/PageStateMessage";
import { useBattlePreviewData } from "@/features/battlePreview/hooks/useBattlePreviewData";
import { isPokemonAvailableForRule } from "@/features/pokemonRules/isPokemonAvailableForRule";
import { getPokemonTypeMeta } from "@/features/pokemonTypes/pokemonTypeMeta";
import { fetchPokemonCommonMoves } from "@/features/pokemonCommonMoves/api/pokemonCommonMoveApi";
import {
  createQuizRandomSeed,
  createSeededRandom,
  getRandomItem,
} from "@/features/quizzes/utils/quizRandom";
import {
  createSelectionJudgmentEvaluation,
  createSelectionJudgmentOverallEvaluation,
  type SelectionJudgmentEvaluation,
  type SelectionJudgmentEvaluationStatus,
  type SelectionJudgmentOverallEvaluation,
  type SelectionJudgmentOverallRank,
  type SelectionJudgmentSpeedStatus,
} from "@/features/quizzes/utils/selectionJudgmentQuiz";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonCommonMove } from "@/types/pokemonCommonMove";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type ResolvedPartyPokemon = {
  partyPokemon: PartyPokemon;
  pokemon: Pokemon;
};

type PartyPokemonEvaluation = ResolvedPartyPokemon & {
  evaluation: SelectionJudgmentEvaluation;
  overall: SelectionJudgmentOverallEvaluation;
};

const evaluationStatusLabels: Record<
  SelectionJudgmentEvaluationStatus,
  string
> = {
  strong: "◎",
  neutral: "○",
  weak: "△",
  unknown: "－",
};

const speedStatusLabels: Record<SelectionJudgmentSpeedStatus, string> = {
  faster: "○",
  same: "－",
  slower: "△",
};

const overallRankLabels: Record<SelectionJudgmentOverallRank, string> = {
  excellent: "◎ とても対応しやすい",
  good: "○ 対応しやすい",
  possible: "△ 対応可能",
  difficult: "▲ 対応しづらい",
  insufficient: "－ 評価情報が不足",
};

const overallRankStyles: Record<SelectionJudgmentOverallRank, string> = {
  excellent: "border-green-300 bg-green-50 text-green-800",
  good: "border-blue-300 bg-blue-50 text-blue-800",
  possible: "border-amber-300 bg-amber-50 text-amber-800",
  difficult: "border-orange-300 bg-orange-50 text-orange-800",
  insufficient: "border-gray-300 bg-gray-50 text-gray-700",
};

const comparableRankOrder: Record<
  Exclude<SelectionJudgmentOverallRank, "insufficient">,
  number
> = {
  difficult: 0,
  possible: 1,
  good: 2,
  excellent: 3,
};

const getPokemonIdentifier = (
  pokemon: Pick<Pokemon, "key" | "form_key">,
): string => `${pokemon.key}:${pokemon.form_key}`;

const getDisplayName = ({
  partyPokemon,
  pokemon,
}: ResolvedPartyPokemon): string => partyPokemon.nickname || pokemon.name;

const EvaluationItem = ({
  label,
  symbol,
  reason,
}: {
  label: string;
  symbol: string;
  reason: string;
}) => (
  <div className="min-w-0 rounded border border-gray-200 bg-white p-3">
    <p className="font-bold text-gray-900">
      {label} <span className="ml-1">{symbol}</span>
    </p>
    <p className="mt-2 text-sm leading-6 text-gray-700">{reason}</p>
  </div>
);

export default function SelectionJudgmentQuizPage() {
  const params = useParams<{ partyId: string }>();
  const partyId = Number(params.partyId);
  const isInvalidPartyId = Number.isNaN(partyId);
  const [questionSeed, setQuestionSeed] = useState(createQuizRandomSeed);
  const [excludedOpponentIdentifier, setExcludedOpponentIdentifier] =
    useState<string | null>(null);
  const [selectedPartyPokemonId, setSelectedPartyPokemonId] = useState<
    number | null
  >(null);
  const [commonMoveData, setCommonMoveData] = useState<{
    opponentIdentifier: string;
    moves: PokemonCommonMove[];
  } | null>(null);
  const [isCommonMoveLoading, setIsCommonMoveLoading] = useState(false);
  const [commonMoveErrorMessage, setCommonMoveErrorMessage] = useState("");

  const { party, pokemonList, isLoading, errorMessage } = useBattlePreviewData({
    partyId,
    isInvalidPartyId,
  });

  const partyPokemonList = party?.current_version?.pokemon ?? [];
  const resolvedPartyPokemonList = partyPokemonList
    .map((partyPokemon): ResolvedPartyPokemon | null => {
      const pokemon = pokemonList.find(
        (master) =>
          master.key === partyPokemon.pokemon_key &&
          master.form_key === partyPokemon.form_key,
      );

      return pokemon ? { partyPokemon, pokemon } : null;
    })
    .filter(
      (candidate): candidate is ResolvedPartyPokemon => candidate !== null,
    );
  const opponentCandidates = party
    ? pokemonList.filter((pokemon) =>
        isPokemonAvailableForRule(pokemon, party.rule),
      )
    : [];
  const selectableOpponentCandidates =
    opponentCandidates.length > 1 && excludedOpponentIdentifier
      ? opponentCandidates.filter(
          (pokemon) =>
            getPokemonIdentifier(pokemon) !== excludedOpponentIdentifier,
        )
      : opponentCandidates;
  const opponentPokemon =
    selectableOpponentCandidates.length > 0
      ? getRandomItem(
          selectableOpponentCandidates,
          createSeededRandom(questionSeed),
        )
      : null;
  const opponentIdentifier = opponentPokemon
    ? getPokemonIdentifier(opponentPokemon)
    : "";
  const partyRule = party?.rule;
  const opponentPokemonKey = opponentPokemon?.key;
  const opponentFormKey = opponentPokemon?.form_key;

  useEffect(() => {
    if (
      !partyRule ||
      !opponentPokemonKey ||
      opponentFormKey === undefined ||
      !opponentIdentifier
    ) {
      return;
    }

    let isCancelled = false;

    const loadCommonMoves = async () => {
      setIsCommonMoveLoading(true);
      setCommonMoveErrorMessage("");
      setCommonMoveData(null);

      try {
        const moves = await fetchPokemonCommonMoves({
          rule: partyRule,
          pokemonKey: opponentPokemonKey,
          formKey: opponentFormKey,
        });

        if (!isCancelled) {
          setCommonMoveData({
            opponentIdentifier,
            moves,
          });
        }
      } catch (error) {
        console.error(error);

        if (!isCancelled) {
          setCommonMoveData(null);
          setCommonMoveErrorMessage(
            "相手ポケモンのよく使われる技の取得に失敗しました。",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsCommonMoveLoading(false);
        }
      }
    };

    loadCommonMoves();

    return () => {
      isCancelled = true;
    };
  }, [
    opponentFormKey,
    opponentIdentifier,
    opponentPokemonKey,
    partyRule,
    questionSeed,
  ]);

  if (isInvalidPartyId) {
    return (
      <PageStateMessage
        message="パーティIDが正しくありません。"
        variant="error"
      />
    );
  }

  if (isLoading) {
    return <PageStateMessage message="読み込み中..." />;
  }

  if (errorMessage || !party) {
    return (
      <PageStateMessage
        message={errorMessage || "パーティが見つかりません。"}
        variant="error"
      />
    );
  }

  if (resolvedPartyPokemonList.length === 0) {
    return (
      <>
        <AppHeader />
        <PageStateMessage
          message="現在のパーティに回答できるポケモンがいません。"
          variant="error"
        />
      </>
    );
  }

  if (!opponentPokemon) {
    return (
      <>
        <AppHeader />
        <PageStateMessage
          message="現在のルールでは出題できる相手ポケモンがいません。"
          variant="error"
        />
      </>
    );
  }

  const hasCurrentCommonMoves =
    commonMoveData?.opponentIdentifier === opponentIdentifier;
  const isCommonMovePending =
    isCommonMoveLoading || (!hasCurrentCommonMoves && !commonMoveErrorMessage);
  const partyPokemonEvaluations: PartyPokemonEvaluation[] =
    hasCurrentCommonMoves && selectedPartyPokemonId !== null
      ? resolvedPartyPokemonList.map((candidate) => {
          const evaluation = createSelectionJudgmentEvaluation({
            partyPokemon: candidate.partyPokemon,
            ownPokemon: candidate.pokemon,
            opponentPokemon,
            opponentCommonMoves: commonMoveData.moves,
          });

          return {
            ...candidate,
            evaluation,
            overall: createSelectionJudgmentOverallEvaluation(evaluation),
          };
        })
      : [];
  const selectedEvaluation = partyPokemonEvaluations.find(
    ({ partyPokemon }) => partyPokemon.id === selectedPartyPokemonId,
  );
  const comparablePokemon = partyPokemonEvaluations.filter(
    ({ overall }) => overall.rank !== "insufficient",
  );
  const highestEvaluation =
    comparablePokemon.reduce<PartyPokemonEvaluation | null>(
      (highest, candidate) => {
        if (!highest) {
          return candidate;
        }

        const candidateRank =
          comparableRankOrder[
            candidate.overall.rank as Exclude<
              SelectionJudgmentOverallRank,
              "insufficient"
            >
          ];
        const highestRank =
          comparableRankOrder[
            highest.overall.rank as Exclude<
              SelectionJudgmentOverallRank,
              "insufficient"
            >
          ];

        if (
          candidateRank > highestRank ||
          (candidateRank === highestRank &&
            candidate.overall.score > highest.overall.score)
        ) {
          return candidate;
        }

        return highest;
      },
      null,
    );

  let feedbackMessage = "";
  let moreSuitableCandidate: PartyPokemonEvaluation | null = null;

  if (selectedEvaluation) {
    if (comparablePokemon.length === 0) {
      feedbackMessage =
        "十分な評価情報がないため、パーティ内の比較ができません。";
    } else if (selectedEvaluation.overall.rank === "insufficient") {
      feedbackMessage = "評価に必要な情報が不足しています。";
      moreSuitableCandidate = highestEvaluation;
    } else {
      const selectedRankValue =
        comparableRankOrder[selectedEvaluation.overall.rank];
      const highestRankValue = highestEvaluation
        ? comparableRankOrder[
            highestEvaluation.overall.rank as Exclude<
              SelectionJudgmentOverallRank,
              "insufficient"
            >
          ]
        : selectedRankValue;
      const rankDifference = highestRankValue - selectedRankValue;
      const scoreDifference = highestEvaluation
        ? highestEvaluation.overall.score - selectedEvaluation.overall.score
        : 0;

      if (rankDifference === 0 && scoreDifference === 0) {
        feedbackMessage = "とても良い選択です！";
      } else if (rankDifference <= 1) {
        feedbackMessage = "良い選択です！";
      } else {
        feedbackMessage = "他にも対応しやすいポケモンがいます。";
      }

      if (rankDifference > 0 || scoreDifference > 0) {
        moreSuitableCandidate = highestEvaluation;
      }
    }
  }

  const handleNextQuestion = () => {
    setSelectedPartyPokemonId(null);
    setCommonMoveData(null);
    setCommonMoveErrorMessage("");
    setIsCommonMoveLoading(true);
    setExcludedOpponentIdentifier(opponentIdentifier);
    setQuestionSeed(createQuizRandomSeed());
  };

  return (
    <>
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <Link href={`/parties/${party.id}`} className="text-sm text-blue-600">
          ← パーティ詳細へ戻る
        </Link>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">選出判断クイズ</h1>
            <p className="mt-1 text-sm text-gray-600">
              完全な正解・不正解ではなく、対応しやすさの理由を確認するクイズです。
            </p>
          </div>

          <p className="text-sm text-gray-500">
            {party.rule === "champions" ? "チャンピオンズ" : "本編"}
            ルール
          </p>
        </div>

        <section className="mt-4 rounded border bg-white p-4 sm:p-5">
          <div className="grid items-center gap-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col items-center rounded bg-gray-50 p-3 text-center">
              {opponentPokemon.image_url && (
                <img
                  src={opponentPokemon.image_url}
                  alt={opponentPokemon.name}
                  className="h-28 w-28 object-contain"
                />
              )}

              <p className="mt-1 font-bold">{opponentPokemon.name}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {opponentPokemon.types.map((type) => {
                  const typeMeta = getPokemonTypeMeta(type);

                  return (
                    <span
                      key={type}
                      className={`rounded border px-2 py-1 text-xs ${typeMeta.className}`}
                    >
                      {typeMeta.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-500">問題</p>
              <h2 className="mt-2 text-lg leading-8 font-bold sm:text-xl">
                相手に{opponentPokemon.name}がいます。
                <br />
                あなたのパーティで、より対応しやすいポケモンは誰？
              </h2>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded border bg-white p-4 sm:p-5">
          <h2 className="font-bold">対応しやすいと思うポケモンを選んでください</h2>

          {isCommonMovePending ? (
            <div className="mt-4 rounded bg-gray-50 p-8 text-center text-gray-600">
              相手ポケモンのよく使われる技を読み込み中...
            </div>
          ) : commonMoveErrorMessage ? (
            <div className="mt-4 rounded bg-red-50 p-6 text-center text-red-700">
              <p>{commonMoveErrorMessage}</p>
              <button
                type="button"
                onClick={handleNextQuestion}
                className="mt-4 rounded bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
              >
                次の問題
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {resolvedPartyPokemonList.map((candidate) => {
                const isSelected =
                  candidate.partyPokemon.id === selectedPartyPokemonId;

                return (
                  <button
                    key={candidate.partyPokemon.id}
                    type="button"
                    disabled={selectedPartyPokemonId !== null}
                    aria-pressed={isSelected}
                    onClick={() =>
                      setSelectedPartyPokemonId(candidate.partyPokemon.id)
                    }
                    className={`flex min-w-0 flex-col items-center rounded border p-3 text-center transition-colors disabled:cursor-not-allowed sm:p-4 ${isSelected ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" : "border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-70"}`}
                  >
                    {candidate.pokemon.image_url && (
                      <img
                        src={candidate.pokemon.image_url}
                        alt={candidate.pokemon.name}
                        className="h-20 w-20 object-contain sm:h-24 sm:w-24"
                      />
                    )}

                    <span className="mt-2 min-w-0 max-w-full truncate font-bold">
                      {getDisplayName(candidate)}
                    </span>
                    {candidate.partyPokemon.nickname && (
                      <span className="mt-1 text-xs text-gray-500">
                        {candidate.pokemon.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {selectedEvaluation && (
          <section className="mt-4 rounded border bg-white p-4 sm:p-5">
            <div
              role="status"
              className="rounded bg-blue-50 px-4 py-3 font-bold text-blue-800"
            >
              {feedbackMessage}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">選んだポケモン</p>
                <h2 className="text-xl font-bold">
                  {getDisplayName(selectedEvaluation)}の評価
                </h2>
              </div>

              <div
                className={`rounded border px-4 py-3 sm:max-w-md ${overallRankStyles[selectedEvaluation.overall.rank]}`}
              >
                <p className="font-bold">
                  総合評価{" "}
                  {overallRankLabels[selectedEvaluation.overall.rank]}
                </p>
                <p className="mt-1 text-sm leading-6">
                  {selectedEvaluation.overall.reason}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <EvaluationItem
                label="攻撃面"
                symbol={
                  evaluationStatusLabels[
                    selectedEvaluation.evaluation.offense.status
                  ]
                }
                reason={selectedEvaluation.evaluation.offense.reason}
              />
              <EvaluationItem
                label="防御面"
                symbol={
                  evaluationStatusLabels[
                    selectedEvaluation.evaluation.defense.status
                  ]
                }
                reason={selectedEvaluation.evaluation.defense.reason}
              />
              <EvaluationItem
                label="素早さ"
                symbol={
                  speedStatusLabels[selectedEvaluation.evaluation.speed.status]
                }
                reason={selectedEvaluation.evaluation.speed.reason}
              />
            </div>

            {moreSuitableCandidate && (
              <p className="mt-4 rounded bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                より対応しやすい候補：
                {getDisplayName(moreSuitableCandidate)}
              </p>
            )}

            <button
              type="button"
              onClick={handleNextQuestion}
              className="mt-5 w-full rounded bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 sm:ml-auto sm:block sm:w-auto sm:min-w-48"
            >
              次の問題
            </button>
          </section>
        )}
      </main>
    </>
  );
}
