"use client";

import { pokemonTypes } from "@/constants/pokemonTypes";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import { toHiragana } from "@/utils/kana";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BattlePreviewPage() {
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [opponentPokemonList, setOpponentPokemonList] = useState<Pokemon[]>(
        [],
    );

    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

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

    const handleToggleType = (type: string) => {
        setSelectedTypes((currentTypes) => {
            if (currentTypes.includes(type)) {
                return currentTypes.filter(
                    (currentType) => currentType !== type,
                );
            }

            if (currentTypes.length >= 2) {
                return [currentTypes[1], type];
            }

            return [...currentTypes, type];
        });
    };

    const handleAddOpponentPokemon = (pokemon: Pokemon) => {
        if (opponentPokemonList.length >= 6) {
            return;
        }

        const alreadySelected = opponentPokemonList.some(
            (selectedPokemon) =>
                selectedPokemon.key === pokemon.key &&
                selectedPokemon.form_key === pokemon.form_key,
        );

        if (alreadySelected) {
            return;
        }

        setOpponentPokemonList((currentList) => [...currentList, pokemon]);
    };

    const handleRemoveOpponentPokemon = (pokemon: Pokemon) => {
        setOpponentPokemonList((currentList) =>
            currentList.filter(
                (selectedPokemon) =>
                    !(
                        selectedPokemon.key === pokemon.key &&
                        selectedPokemon.form_key === pokemon.form_key
                    ),
            ),
        );
    };

    const normalizedKeyword = toHiragana(searchKeyword.trim());

    const filteredPokemonList = pokemonList.filter((pokemon) => {
        const normalizedName = toHiragana(pokemon.name);
        const normalizedKana = toHiragana(pokemon.kana);

        const matchesKeyword =
            normalizedKeyword === "" ||
            normalizedName.includes(normalizedKeyword) ||
            normalizedKana.includes(normalizedKeyword);

        const matchesTypes =
            selectedTypes.length === 0 ||
            selectedTypes.every((type) => pokemon.types.includes(type));

        return matchesKeyword && matchesTypes;
    });

    if (isInvalidPartyId) {
        return (
            <main className="mx-auto max-w-6xl p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    パーティIDが正しくありません。
                </p>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="mx-auto max-w-6xl p-8">
                <p>読み込み中...</p>
            </main>
        );
    }

    if (errorMessage || !party) {
        return (
            <main className="mx-auto max-w-6xl p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    {errorMessage || "パーティが見つかりません。"}
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-6xl p-8">
            <Link
                href={`/parties/${party.id}`}
                className="text-sm text-blue-600"
            >
                ← パーティ詳細へ戻る
            </Link>

            <div className="mt-4">
                <h1 className="text-2xl font-bold">対戦前選出</h1>
                <p className="mt-1 text-sm text-gray-600">
                    相手の6匹を入力して、選出判断の準備をします。
                </p>
            </div>

            <section className="mt-8 rounded border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">相手パーティ</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            最大6匹まで選択できます。
                        </p>
                    </div>

                    <p className="text-sm font-medium">
                        {opponentPokemonList.length} / 6
                    </p>
                </div>

                {opponentPokemonList.length === 0 ? (
                    <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                        まだ相手ポケモンが選択されていません。
                    </p>
                ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {opponentPokemonList.map((pokemon) => (
                            <div
                                key={`${pokemon.key}-${pokemon.form_key}`}
                                className="flex items-center justify-between rounded border p-3"
                            >
                                <div className="flex items-center gap-3">
                                    {pokemon.image_url ? (
                                        <img
                                            src={pokemon.image_url}
                                            alt={pokemon.name}
                                            className="h-14 w-14 object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-sm">
                                            ?
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-bold">
                                            {pokemon.name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {pokemon.types.join(" / ")}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRemoveOpponentPokemon(pokemon)
                                    }
                                    className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                                >
                                    削除
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="mt-8 rounded border p-6">
                <h2 className="text-xl font-bold">相手ポケモンを探す</h2>

                <div className="mt-4">
                    <label className="block text-sm font-medium">
                        ポケモン名で検索
                    </label>
                    <input
                        className="mt-1 w-full rounded border p-3"
                        value={searchKeyword}
                        onChange={(event) =>
                            setSearchKeyword(event.target.value)
                        }
                        placeholder="例：リザードン、りざ、ガブ"
                    />
                </div>

                <div className="mt-5">
                    <p className="text-sm font-medium">タイプで絞り込み</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {pokemonTypes.map((type) => {
                            const isSelected = selectedTypes.includes(type);

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleToggleType(type)}
                                    className={`rounded-full border px-3 py-1 text-sm ${
                                        isSelected
                                            ? "border-black bg-black text-white"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {type}
                                </button>
                            );
                        })}
                    </div>

                    {selectedTypes.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setSelectedTypes([])}
                            className="mt-3 text-sm text-blue-600"
                        >
                            タイプ絞り込みを解除
                        </button>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        候補：{filteredPokemonList.length}件
                    </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {filteredPokemonList.map((pokemon) => {
                        const isSelected = opponentPokemonList.some(
                            (selectedPokemon) =>
                                selectedPokemon.key === pokemon.key &&
                                selectedPokemon.form_key === pokemon.form_key,
                        );

                        return (
                            <button
                                key={`${pokemon.key}-${pokemon.form_key}`}
                                type="button"
                                onClick={() =>
                                    handleAddOpponentPokemon(pokemon)
                                }
                                disabled={
                                    isSelected ||
                                    opponentPokemonList.length >= 6
                                }
                                className={`rounded border p-3 text-left transition disabled:cursor-not-allowed ${
                                    isSelected
                                        ? "border-black bg-gray-100"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {pokemon.image_url ? (
                                        <img
                                            src={pokemon.image_url}
                                            alt={pokemon.name}
                                            className="h-16 w-16 object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-sm">
                                            ?
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-bold">
                                            {pokemon.name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {pokemon.kana}
                                        </p>
                                        <p className="mt-1 text-xs">
                                            {pokemon.types.join(" / ")}
                                        </p>
                                        {isSelected && (
                                            <p className="mt-1 text-xs font-medium">
                                                選択済み
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {filteredPokemonList.length === 0 && (
                    <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                        条件に合うポケモンが見つかりません。
                    </p>
                )}
            </section>
        </main>
    );
}
