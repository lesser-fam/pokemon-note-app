"use client";

import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PartyDetailPage() {
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadParty = async () => {
            try {
                const [partyData, pokemonData] = await Promise.all([
                    fetchParty(partyId),
                    fetchPokemonList(),
                ]);

                setParty(partyData);
                setPokemonList(pokemonData);
            } catch (error) {
                console.error(error);
                setErrorMessage("パーティ詳細の取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (isInvalidPartyId) {
            return;
        }

        loadParty();
    }, [partyId, isInvalidPartyId]);

    if (isInvalidPartyId) {
        return (
            <main className="mx-auto max-w-5x1 p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    パーティIDが正しくありません。
                </p>
            </main>
        );
    }

    const findPokemonMaster = (pokemonKey: string, formKey: string) => {
        return pokemonList.find(
            (pokemon) =>
                pokemon.key === pokemonKey && pokemon.form_key === formKey,
        );
    };

    if (isLoading) {
        return (
            <main className="mx-auto max-w-5xl p-8">
                <p>読み込み中...</p>
            </main>
        );
    }

    if (errorMessage || !party) {
        return (
            <main className="mx-auto max-w-5xl p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    {errorMessage || "パーティが見つかりません。"}
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl p-8">
            <Link href="/parties" className="text-sm text-blue-600">
                ← パーティ一覧へ戻る
            </Link>

            <div className="mt-4 rounded border p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{party.name}</h1>

                    {party.current_version && (
                        <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                            現在のバージョン：v
                            {party.current_version.version_number}
                        </span>
                    )}
                </div>

                {party.concept && (
                    <div className="mt-6">
                        <h2 className="font-semibold">コンセプト</h2>
                        <p className="mt-1 text-gray-700">{party.concept}</p>
                    </div>
                )}

                {party.memo && (
                    <div className="mt-6">
                        <h2 className="font-semibold">メモ</h2>
                        <p className="mt-1 text-gray-700">{party.memo}</p>
                    </div>
                )}
            </div>

            <section className="mt-8 rounded border p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">登録ポケモン</h2>

                    <Link
                        href={`/parties/${party.id}/pokemon/create`}
                        className="rounded bg-black px-4 py-2 text-white"
                    >
                        ポケモンを追加
                    </Link>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {party.current_version?.pokemon &&
                    party.current_version.pokemon.length > 0 ? (
                        party.current_version.pokemon.map((pokemon) => {
                            const pokemonMaster = findPokemonMaster(
                                pokemon.pokemon_key,
                                pokemon.form_key,
                            );

                            return (
                                <div
                                    key={pokemon.id}
                                    className="rounded border p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        {pokemonMaster?.image_url ? (
                                            <img
                                                src={pokemonMaster.image_url}
                                                alt={pokemonMaster.name}
                                                className="h-20 w-20 object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                                                ?
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-lg font-bold">
                                                {pokemon.nickname ||
                                                    pokemonMaster?.name ||
                                                    pokemon.pokemon_key}
                                            </p>

                                            {pokemonMaster && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {pokemonMaster.types.join(
                                                        " / ",
                                                    )}
                                                </p>
                                            )}

                                            <p className="mt-1 text-xs text-gray-400">
                                                key: {pokemon.pokemon_key} /
                                                form: {pokemon.form_key}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-2 text-sm text-gray-700">
                                        {pokemon.item && (
                                            <p>持ち物：{pokemon.item}</p>
                                        )}
                                        {pokemon.ability && (
                                            <p>特性：{pokemon.ability}</p>
                                        )}
                                        {pokemon.nature && (
                                            <p>性格：{pokemon.nature}</p>
                                        )}
                                    </div>

                                    <div className="mt-4 text-sm text-gray-700">
                                        <p className="font-medium">技</p>
                                        <ul className="mt-1 ml-4 list-disc">
                                            {[
                                                pokemon.move_1,
                                                pokemon.move_2,
                                                pokemon.move_3,
                                                pokemon.move_4,
                                            ]
                                                .filter(Boolean)
                                                .map((move) => (
                                                    <li key={move}>{move}</li>
                                                ))}
                                        </ul>
                                    </div>

                                    {pokemon.role_tags &&
                                        pokemon.role_tags.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {pokemon.role_tags.map(
                                                    (tag) => (
                                                        <span
                                                            key={tag.id}
                                                            className="rounded bg-gray-100 px-2 py-1 text-xs"
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-600">
                            まだポケモンが登録されていません。
                        </p>
                    )}
                </div>
            </section>

            <section className="mt-8 rounded border p-6">
                <h2 className="text-xl font-bold">バージョン履歴</h2>

                <div className="mt-4 space-y-3">
                    {party.versions?.map((version) => (
                        <div
                            key={version.id}
                            className="rounded bg-gray-50 p-4"
                        >
                            <p className="font-semibold">
                                v{version.version_number}
                                {version.is_current && "（現在）"}
                            </p>
                            {version.change_note && (
                                <p className="mt-1 text-sm text-gray-600">
                                    {version.change_note}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
