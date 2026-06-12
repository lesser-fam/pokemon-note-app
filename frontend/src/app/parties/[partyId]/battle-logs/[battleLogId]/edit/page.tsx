"use client";

import { AppHeader } from "@/components/AppHeader";
import { updateBattleLog } from "@/features/battleLogs/api/battleLogApi";
import {
    BattleLogForm,
    type BattleLogFormInitialValues,
    type OpponentPokemonPair,
} from "@/features/battleLogs/components/BattleLogForm";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import type { BattleLog, Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditBattleLogPage() {
    const router = useRouter();

    const params = useParams<{
        partyId: string;
        battleLogId: string;
    }>();

    const partyId = Number(params.partyId);

    const battleLogId = Number(params.battleLogId);

    const isInvalidId = Number.isNaN(partyId) || Number.isNaN(battleLogId);

    const [party, setParty] = useState<Party | null>(null);

    const [battleLog, setBattleLog] = useState<BattleLog | null>(null);

    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [partyData, pokemonData] = await Promise.all([
                    fetchParty(partyId),
                    fetchPokemonList(),
                ]);

                const targetBattleLog =
                    partyData.current_version?.battle_logs?.find(
                        (log) => log.id === battleLogId,
                    ) ?? null;

                setParty(partyData);
                setPokemonList(pokemonData);
                setBattleLog(targetBattleLog);
            } catch (error) {
                console.error(error);

                setErrorMessage("対戦ログの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (isInvalidId) {
            return;
        }

        loadData();
    }, [partyId, battleLogId, isInvalidId]);

    if (isInvalidId) {
        return (
            <main className="mx-auto max-w-5xl p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    URLが正しくありません。
                </p>
            </main>
        );
    }

    if (isLoading) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-5xl p-8">
                    <p>読み込み中...</p>
                </main>
            </>
        );
    }

    if (errorMessage || !party || !battleLog) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-5xl p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        {errorMessage || "対戦ログが見つかりません。"}
                    </p>
                </main>
            </>
        );
    }

    const opponentPokemonPairs: OpponentPokemonPair[] = [
        {
            key: battleLog.opponent_pokemon_1,
            form_key: battleLog.opponent_form_1,
        },
        {
            key: battleLog.opponent_pokemon_2,
            form_key: battleLog.opponent_form_2,
        },
        {
            key: battleLog.opponent_pokemon_3,
            form_key: battleLog.opponent_form_3,
        },
        {
            key: battleLog.opponent_pokemon_4,
            form_key: battleLog.opponent_form_4,
        },
        {
            key: battleLog.opponent_pokemon_5,
            form_key: battleLog.opponent_form_5,
        },
        {
            key: battleLog.opponent_pokemon_6,
            form_key: battleLog.opponent_form_6,
        },
    ]
        .filter(
            (
                pokemon,
            ): pokemon is {
                key: string;
                form_key: string | null;
            } => Boolean(pokemon.key),
        )
        .map((pokemon) => ({
            key: pokemon.key,
            form_key: pokemon.form_key || "default",
        }));

    const selectedOpponentPokemonKeys = [
        [
            battleLog.selected_opponent_pokemon_1,
            battleLog.selected_opponent_form_1,
        ],
        [
            battleLog.selected_opponent_pokemon_2,
            battleLog.selected_opponent_form_2,
        ],
        [
            battleLog.selected_opponent_pokemon_3,
            battleLog.selected_opponent_form_3,
        ],
    ]
        .filter((pokemon): pokemon is [string, string | null] =>
            Boolean(pokemon[0]),
        )
        .map(
            ([pokemonKey, formKey]) => `${pokemonKey}:${formKey || "default"}`,
        );

    const initialValues: BattleLogFormInitialValues = {
        result: battleLog.result,

        selectedPokemonIds: [
            battleLog.selected_pokemon_1_id,
            battleLog.selected_pokemon_2_id,
            battleLog.selected_pokemon_3_id,
        ].filter((id): id is number => id !== null),

        selectedOpponentPokemonKeys,

        heavyOpponent: battleLog.heavy_opponent_key
            ? `${battleLog.heavy_opponent_key}:${
                  battleLog.heavy_opponent_form || "default"
              }`
            : "",

        neededPokemonId: battleLog.needed_pokemon_id
            ? String(battleLog.needed_pokemon_id)
            : "",

        lossTags: battleLog.loss_tags ?? [],

        reflection: battleLog.reflection ?? "",

        nextNote: battleLog.next_note ?? "",
    };

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-5xl p-8">
                <Link
                    href={`/parties/${party.id}`}
                    className="text-sm text-blue-600"
                >
                    ← パーティ詳細へ戻る
                </Link>

                <h1 className="mt-4 text-2xl font-bold">対戦ログ編集</h1>

                <p className="mt-1 text-sm text-gray-600">
                    保存済みの対戦結果と反省を修正します。
                </p>

                <BattleLogForm
                    party={party}
                    pokemonList={pokemonList}
                    opponentPokemonPairs={opponentPokemonPairs}
                    initialValues={initialValues}
                    submitLabel="変更を保存する"
                    submittingLabel="保存中..."
                    onSubmit={async (payload) => {
                        await updateBattleLog(battleLog.id, payload);

                        router.push(`/parties/${party.id}`);
                    }}
                />
            </main>
        </>
    );
}
