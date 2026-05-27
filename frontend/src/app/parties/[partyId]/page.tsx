"use client";

import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { suggestBasicSelection } from "@/features/selections/utils/suggestBasicSelection";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createSelectionTemplate } from "@/features/selectionTemplates/api/selectionTemplateApi";

export default function PartyDetailPage() {
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingSelection, setIsSavingSelection] = useState(false);
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

    const currentPokemonList = party.current_version?.pokemon ?? [];
    const suggestedSelection = suggestBasicSelection(currentPokemonList);

    const handleSaveSuggestedSelection = async () => {
        if (!party.current_version) {
            setErrorMessage("現在のバージョンが見つかりません。");
            return;
        }

        const lead = suggestedSelection.find(
            (suggestion) => suggestion.role === "lead",
        );
        const switchPokemon = suggestedSelection.find(
            (suggestion) => suggestion.role === "switch",
        );
        const finisher = suggestedSelection.find(
            (suggestion) => suggestion.role === "finisher",
        );

        if (!lead?.pokemon || !switchPokemon?.pokemon || !finisher?.pokemon) {
            setErrorMessage("保存できる基本選出がありません。");
            return;
        }

        setIsSavingSelection(true);
        setErrorMessage("");

        try {
            await createSelectionTemplate(party.current_version.id, {
                name: "おすすめ基本選出",
                lead_pokemon_id: lead.pokemon.id,
                switch_pokemon_id: switchPokemon.pokemon.id,
                finisher_pokemon_id: finisher.pokemon.id,
                memo: "役割タグの点数から自動提案された基本選出です。",
            });

            const refreshedParty = await fetchParty(party.id);
            setParty(refreshedParty);
        } catch (error) {
            console.error(error);
            setErrorMessage("基本選出の保存に失敗しました。");
        } finally {
            setIsSavingSelection(false);
        }
    };

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
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold">おすすめ基本選出</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            役割タグの点数から、初手・引き先・勝ち筋を仮提案します。
                        </p>
                    </div>

                    {currentPokemonList.length >= 3 && (
                        <button
                            type="button"
                            onClick={handleSaveSuggestedSelection}
                            disabled={isSavingSelection}
                            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                            {isSavingSelection
                                ? "保存中..."
                                : "この基本選出を保存"}
                        </button>
                    )}
                </div>

                {currentPokemonList.length < 3 ? (
                    <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                        基本選出を提案するには、ポケモンを3匹以上登録してください。
                    </p>
                ) : (
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {suggestedSelection.map((suggestion) => {
                            const pokemonMaster = suggestion.pokemon
                                ? findPokemonMaster(
                                      suggestion.pokemon.pokemon_key,
                                      suggestion.pokemon.form_key,
                                  )
                                : null;

                            return (
                                <div
                                    key={suggestion.role}
                                    className="rounded border p-4"
                                >
                                    <p className="text-sm font-semibold text-gray-500">
                                        {suggestion.label}
                                    </p>

                                    {suggestion.pokemon ? (
                                        <>
                                            <div className="mt-3 flex items-center gap-3">
                                                {pokemonMaster?.image_url ? (
                                                    <img
                                                        src={
                                                            pokemonMaster.image_url
                                                        }
                                                        alt={pokemonMaster.name}
                                                        className="h-16 w-16 object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                                                        ?
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-bold">
                                                        {suggestion.pokemon
                                                            .nickname ||
                                                            pokemonMaster?.name ||
                                                            suggestion.pokemon
                                                                .pokemon_key}
                                                    </p>

                                                    {pokemonMaster && (
                                                        <p className="mt-1 text-xs text-gray-600">
                                                            {pokemonMaster.types.join(
                                                                " / ",
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="mt-3 text-sm text-gray-700">
                                                {suggestion.reason}
                                            </p>

                                            <p className="mt-2 text-xs text-gray-500">
                                                点数：{suggestion.score}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="mt-3 text-sm text-gray-600">
                                            候補がありません。
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="mt-8 rounded border p-6">
                <h2 className="text-xl font-bold">保存済み基本選出</h2>
                <p className="mt-1 text-sm text-gray-600">
                    保存した基本選出です。対戦前の選出候補として使います。
                </p>

                {party.current_version?.selection_templates &&
                party.current_version.selection_templates.length > 0 ? (
                    <div className="mt-4 space-y-4">
                        {party.current_version.selection_templates.map(
                            (template) => (
                                <div
                                    key={template.id}
                                    className="rounded bg-gray-50 p-4"
                                >
                                    <p className="font-bold">{template.name}</p>

                                    {template.memo && (
                                        <p className="mt-1 text-sm text-gray-600">
                                            {template.memo}
                                        </p>
                                    )}

                                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                                        <div className="rounded bg-white p-3">
                                            <p className="text-xs text-gray-500">
                                                初手
                                            </p>
                                            <p className="font-semibold">
                                                {template.lead_pokemon
                                                    ?.nickname ||
                                                    template.lead_pokemon
                                                        ?.pokemon_key}
                                            </p>
                                        </div>

                                        <div className="rounded bg-white p-3">
                                            <p className="text-xs text-gray-500">
                                                引き先
                                            </p>
                                            <p className="font-semibold">
                                                {template.switch_pokemon
                                                    ?.nickname ||
                                                    template.switch_pokemon
                                                        ?.pokemon_key}
                                            </p>
                                        </div>

                                        <div className="rounded bg-white p-3">
                                            <p className="text-xs text-gray-500">
                                                勝ち筋
                                            </p>
                                            <p className="font-semibold">
                                                {template.finisher_pokemon
                                                    ?.nickname ||
                                                    template.finisher_pokemon
                                                        ?.pokemon_key}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                ) : (
                    <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                        まだ基本選出は保存されていません。
                    </p>
                )}
            </section>

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
