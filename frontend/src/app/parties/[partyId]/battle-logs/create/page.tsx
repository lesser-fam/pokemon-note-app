"use client";

import { AppHeader } from "@/components/AppHeader";
import { createBattleLog } from "@/features/battleLogs/api/battleLogApi";
import {
    BattleLogForm,
    type BattleLogFormInitialValues,
    type OpponentPokemonPair,
} from "@/features/battleLogs/components/BattleLogForm";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateBattleLogPage() {
    const router = useRouter();

    const params = useParams<{
        partyId: string;
    }>();

    const searchParams = useSearchParams();

    const partyId = Number(params.partyId);

    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);

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

                setParty(partyData);
                setPokemonList(pokemonData);
            } catch (error) {
                console.error(error);

                setErrorMessage("必要なデータの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (isInvalidPartyId) {
            return;
        }

        loadData();
    }, [partyId, isInvalidPartyId]);

    if (isInvalidPartyId) {
        return (
            <main className="mx-auto max-w-5xl p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    パーティIDが正しくありません。
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

    if (errorMessage || !party) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-5xl p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        {errorMessage || "パーティが見つかりません。"}
                    </p>
                </main>
            </>
        );
    }

    const selectedQuery = searchParams.get("selected") ?? "";

    const initialSelectedPokemonIds = selectedQuery
        .split(",")
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0)
        .slice(0, 3);

    const opponentParam = searchParams.get("opponents") ?? "";

    const opponentPokemonPairs: OpponentPokemonPair[] = opponentParam
        .split(",")
        .filter(Boolean)
        .map((value) => {
            const [key, formKey] = value.split(":");

            return {
                key,
                form_key: formKey || "default",
            };
        });

    const initialValues: BattleLogFormInitialValues = {
        result: "win",
        selectedPokemonIds: initialSelectedPokemonIds,
        selectedOpponentPokemonKeys: [],
        heavyOpponent: "",
        neededPokemonId: "",
        lossTags: [],
        reflection: "",
        nextNote: "",
    };

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-5xl p-8">
                <Link
                    href={`/parties/${party.id}/battle-preview`}
                    className="text-sm text-blue-600"
                >
                    ← 対戦前選出へ戻る
                </Link>

                <h1 className="mt-4 text-2xl font-bold">対戦ログ作成</h1>

                <p className="mt-1 text-sm text-gray-600">
                    対戦結果と反省を記録します。
                </p>

                <BattleLogForm
                    party={party}
                    pokemonList={pokemonList}
                    opponentPokemonPairs={opponentPokemonPairs}
                    initialValues={initialValues}
                    submitLabel="対戦ログを保存する"
                    submittingLabel="保存中..."
                    onSubmit={async (payload) => {
                        if (!party.current_version) {
                            throw new Error(
                                "現在のバージョンが見つかりません。",
                            );
                        }

                        await createBattleLog(
                            party.current_version.id,
                            payload,
                        );

                        router.push(`/parties/${party.id}`);
                    }}
                />
            </main>
        </>
    );
}
