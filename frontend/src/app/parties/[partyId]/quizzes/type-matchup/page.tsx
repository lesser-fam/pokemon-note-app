"use client";

import { AppHeader } from "@/components/AppHeader";
import { PageStateMessage } from "@/components/pageStates/PageStateMessage";
import { useBattlePreviewData } from "@/features/battlePreview/hooks/useBattlePreviewData";
import { getPokemonTypeMeta } from "@/features/pokemonTypes/pokemonTypeMeta";
import {
  createTypeMatchupQuestion,
  formatTypeMultiplier,
  typeMatchupAnswerLabels,
  type TypeMatchupAnswer,
} from "@/features/quizzes/utils/typeMatchupQuiz";
import { createQuizRandomSeed } from "@/features/quizzes/utils/quizRandom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const answerOptions: TypeMatchupAnswer[] = [
  "super_effective",
  "neutral",
  "resisted",
  "immune",
];

export default function TypeMatchupQuizPage() {
  const params = useParams<{ partyId: string }>();
  const partyId = Number(params.partyId);
  const isInvalidPartyId = Number.isNaN(partyId);
  const [questionSeed, setQuestionSeed] = useState(createQuizRandomSeed);
  const [selectedAnswer, setSelectedAnswer] =
    useState<TypeMatchupAnswer | null>(null);

  const { party, pokemonList, isLoading, errorMessage } = useBattlePreviewData({
    partyId,
    isInvalidPartyId,
  });

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

  const question = createTypeMatchupQuestion({
    partyPokemonList: party.current_version?.pokemon ?? [],
    pokemonList,
    randomSeed: questionSeed,
  });

  if (!question) {
    return (
      <>
        <AppHeader />
        <PageStateMessage
          message="現在のパーティに出題できるポケモンがいません。"
          variant="error"
        />
      </>
    );
  }

  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const attackTypeMeta = getPokemonTypeMeta(question.attackType);

  return (
    <>
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:flex lg:h-[calc(100dvh-73px)] lg:flex-col lg:overflow-hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="shrink-0">
            <Link
              href={`/parties/${party.id}`}
              className="text-sm text-blue-600"
            >
              ← パーティ詳細へ戻る
            </Link>

            <h1 className="mt-2 text-2xl font-bold">タイプ相性クイズ</h1>
          </div>

          <p className="rounded bg-amber-50 p-3 text-sm text-amber-800 lg:max-w-2xl">
            タイプ相性のみで判定しています。特性・テラスタル・持ち物・技固有処理は考慮していません。
          </p>
        </div>

        <section className="mt-4 grid gap-4 rounded border bg-white p-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)] lg:p-5">
          <div className="flex flex-col justify-center rounded bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              この攻撃を受けた場合のタイプ相性は？
            </p>

            <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="text-center">
                {question.pokemon.image_url && (
                  <img
                    src={question.pokemon.image_url}
                    alt={question.pokemon.name}
                    className="mx-auto h-28 w-28 object-contain"
                  />
                )}

                <p className="font-bold">
                  {question.partyPokemon.nickname || question.pokemon.name}
                </p>

                <div className="mt-2 flex justify-center gap-1">
                  {question.pokemon.types.map((type) => {
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

              <span className="text-2xl text-gray-400">←</span>

              <div className="text-center">
                <p className="text-sm text-gray-500">受ける技タイプ</p>
                <span
                  className={`mt-2 inline-block rounded border px-4 py-2 font-bold ${attackTypeMeta.className}`}
                >
                  {attackTypeMeta.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded border border-gray-100 p-4 lg:min-h-0">
            <p className="text-sm font-semibold text-gray-700">
              倍率を選んでください
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {answerOptions.map((answer) => (
                <button
                  key={answer}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => setSelectedAnswer(answer)}
                  className="rounded border px-4 py-3 text-left font-semibold hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {typeMatchupAnswerLabels[answer]}
                </button>
              ))}
            </div>

            {isAnswered ? (
              <div
                role="status"
                className={`mt-4 min-h-28 rounded p-4 ${
                  isCorrect
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <p className="font-bold">
                  {isCorrect ? "正解です。" : "不正解です。"}
                </p>
                <p className="mt-2">
                  正解：
                  {typeMatchupAnswerLabels[question.correctAnswer]}
                </p>
                <p>
                  実際の倍率：
                  {formatTypeMultiplier(question.multiplier)}
                </p>
              </div>
            ) : (
              <div className="mt-4 min-h-28 rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                選択すると、正解と実際の倍率がここに表示されます。
              </div>
            )}

            <button
              type="button"
              disabled={!isAnswered}
              onClick={() => {
                setQuestionSeed(createQuizRandomSeed());
                setSelectedAnswer(null);
              }}
              className="mt-4 w-full rounded bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:bg-gray-400 lg:mt-auto"
            >
              次の問題
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
