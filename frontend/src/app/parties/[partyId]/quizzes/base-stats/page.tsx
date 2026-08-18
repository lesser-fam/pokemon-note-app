"use client";

import { AppHeader } from "@/components/AppHeader";
import { PageStateMessage } from "@/components/pageStates/PageStateMessage";
import { useBattlePreviewData } from "@/features/battlePreview/hooks/useBattlePreviewData";
import {
  createBaseStatQuizQuestion,
  type BaseStatAnswer,
} from "@/features/quizzes/utils/baseStatQuiz";
import { createQuizRandomSeed } from "@/features/quizzes/utils/quizRandom";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const PokemonChoice = ({
  pokemon,
  label,
  disabled,
  onSelect,
}: {
  pokemon: Pokemon;
  label: string;
  disabled: boolean;
  onSelect: () => void;
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className="flex w-full min-w-0 flex-col items-center justify-center rounded border bg-white p-4 text-center hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 lg:h-full"
    >
      <p className="text-xs font-semibold text-gray-500">{label}</p>

      {pokemon.image_url && (
        <img
          src={pokemon.image_url}
          alt={pokemon.name}
          className="mx-auto mt-2 h-28 w-28 object-contain"
        />
      )}

      <p className="mt-2 font-bold">{pokemon.name}</p>
    </button>
  );
};

export default function BaseStatQuizPage() {
  const params = useParams<{ partyId: string }>();
  const partyId = Number(params.partyId);
  const isInvalidPartyId = Number.isNaN(partyId);
  const [questionSeed, setQuestionSeed] = useState(createQuizRandomSeed);
  const [selectedAnswer, setSelectedAnswer] = useState<BaseStatAnswer | null>(
    null,
  );

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

  const question = createBaseStatQuizQuestion({
    partyPokemonList: party.current_version?.pokemon ?? [],
    pokemonList,
    rule: party.rule,
    randomSeed: questionSeed,
  });

  if (!question) {
    return (
      <>
        <AppHeader />
        <PageStateMessage
          message="現在のルールでは、同値を避けて出題できる組み合わせが見つかりません。"
          variant="error"
        />
      </>
    );
  }

  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const correctPokemon =
    question.correctAnswer === "base"
      ? question.basePokemon
      : question.comparisonPokemon;

  return (
    <>
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:flex lg:h-[calc(100dvh-73px)] lg:flex-col lg:overflow-hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="shrink-0">
            <Link
              href={`/parties/${party.id}`}
              className="text-sm text-blue-600"
            >
              ← パーティ詳細へ戻る
            </Link>

            <h1 className="mt-2 text-2xl font-bold">種族値感覚クイズ</h1>
          </div>

          <p className="text-sm text-gray-600 lg:max-w-2xl lg:text-right">
            現在のパーティと、
            {party.rule === "champions" ? "チャンピオンズ" : "本編"}
            ルールで利用可能なポケモンを比較します。
          </p>
        </div>

        <section className="mt-4 grid w-full gap-4 rounded border bg-white p-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)] lg:p-5">
          <div className="flex min-w-0 flex-col rounded bg-gray-50 p-4 lg:min-h-0">
            <h2 className="text-center text-lg font-bold">
              どちらの方が{question.statLabel}
              の種族値が高い？
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:min-h-0 lg:flex-1">
              <PokemonChoice
                pokemon={question.basePokemon}
                label="現在のパーティ"
                disabled={isAnswered}
                onSelect={() => setSelectedAnswer("base")}
              />

              <PokemonChoice
                pokemon={question.comparisonPokemon}
                label="比較対象"
                disabled={isAnswered}
                onSelect={() => setSelectedAnswer("comparison")}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col rounded border border-gray-100 p-4 lg:min-h-0">
            <p className="text-sm font-semibold text-gray-700">回答</p>

            {isAnswered ? (
              <div
                role="status"
                className={`mt-4 h-40 w-full overflow-y-auto rounded p-4 break-words ${
                  isCorrect
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <p className="font-bold">
                  {isCorrect ? "正解です。" : "不正解です。"}
                </p>
                <p className="mt-2">正解：{correctPokemon.name}</p>
                <p>
                  {question.basePokemon.name}：
                  {question.basePokemon.base_stats[question.statKey]}／{" "}
                  {question.comparisonPokemon.name}：
                  {question.comparisonPokemon.base_stats[question.statKey]}
                </p>
              </div>
            ) : (
              <div className="mt-4 h-40 w-full rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                高いと思うポケモンを選ぶと、正解と両方の種族値がここに表示されます。
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
