"use client";

import { pokemonTypes } from "@/constants/pokemonTypes";
import { analyzeOpponentParty } from "@/features/battlePreview/utils/analyzeOpponentParty";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { suggestBasicSelection } from "@/features/selections/utils/suggestBasicSelection";
import type { Party, PartyPokemon } from "@/types/party";
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

    const opponentAnalysis = analyzeOpponentParty(opponentPokemonList);

    const renderPokemonIconRanking = (
        pokemonList: {
            key: string;
            form_key: string;
            name: string;
            image_url: string | null;
            value: number;
        }[],
        valueLabel: string,
    ) => {
        if (pokemonList.length === 0) {
            return (
                <p className="mt-3 text-sm text-gray-600">
                    相手ポケモンを入力してください。
                </p>
            );
        }

        return (
            <div className="mt-3 flex flex-wrap gap-3">
                {pokemonList.map((pokemon) => (
                    <div
                        key={`${pokemon.key}-${pokemon.form_key}-${valueLabel}`}
                        className="rounded bg-white p-3 text-center"
                    >
                        {pokemon.image_url ? (
                            <img
                                src={pokemon.image_url}
                                alt={pokemon.name}
                                className="mx-auto h-14 w-14 object-contain"
                            />
                        ) : (
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-sm">
                                ?
                            </div>
                        )}

                        <p className="mt-1 text-xs font-semibold">
                            {pokemon.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {valueLabel}
                            {pokemon.value}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderRatioBar = (
        leftLabel: string,
        leftRate: number,
        rightLabel: string,
        rightRate: number,
    ) => {
        return (
            <div className="mt-3">
                <div className="mb-1 flex justify-between text-sm">
                    <span>
                        {leftLabel} {leftRate}%
                    </span>
                    <span>
                        {rightLabel} {rightRate}%
                    </span>
                </div>

                <div className="flex h-3 overflow-hidden rounded bg-gray-200">
                    <div
                        className="bg-gray-800"
                        style={{ width: `${leftRate}%` }}
                    />
                    <div
                        className="bg-gray-400"
                        style={{ width: `${rightRate}%` }}
                    />
                </div>
            </div>
        );
    };

    const calculateRate = (value: number, total: number) => {
        if (total === 0) {
            return 0;
        }

        return Math.min(100, Math.round((value / total) * 100));
    };

    const findPokemonMaster = (pokemonKey: string, formKey: string) => {
        return pokemonList.find(
            (pokemon) =>
                pokemon.key === pokemonKey && pokemon.form_key === formKey,
        );
    };

    const currentPokemonList = party?.current_version?.pokemon ?? [];
    const suggestedSelection = suggestBasicSelection(currentPokemonList);
    const savedSelectionTemplates =
        party?.current_version?.selection_templates ?? [];

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

    const getPartyPokemonDisplayName = (partyPokemon?: PartyPokemon | null) => {
        if (!partyPokemon) {
            return "未設定";
        }

        const pokemonMaster = findPokemonMaster(
            partyPokemon.pokemon_key,
            partyPokemon.form_key,
        );

        return (
            partyPokemon.nickname ||
            pokemonMaster?.name ||
            partyPokemon.pokemon_key
        );
    };

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
                                        <p className="mt-2 flex flex-wrap gap-1 text-xs text-gray-600">
                                            <span className="rounded bg-gray-100 px-2 py-0.5">
                                                H{pokemon.base_stats.h}
                                            </span>
                                            <span className="rounded bg-gray-100 px-2 py-0.5">
                                                A{pokemon.base_stats.a}
                                            </span>
                                            <span className="rounded bg-gray-100 px-2 py-0.5">
                                                B{pokemon.base_stats.b}
                                            </span>
                                            <span className="rounded bg-gray-100 px-2 py-0.5">
                                                C{pokemon.base_stats.c}
                                            </span>
                                            <span className="rounded bg-gray-100 px-2 py-0.5">
                                                D{pokemon.base_stats.d}
                                            </span>
                                            <span className="rounded bg-gray-100 px-2 py-0.5">
                                                S{pokemon.base_stats.s}
                                            </span>
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
                <h2 className="text-xl font-bold">相手パーティ簡易分析</h2>
                <p className="mt-1 text-sm text-gray-600">
                    入力した相手ポケモンの種族値から、警戒したいポイントを見やすく表示します。
                </p>

                {opponentPokemonList.length === 0 ? (
                    <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                        相手ポケモンを入力すると、ここに分析結果が表示されます。
                    </p>
                ) : (
                    <div className="mt-4 space-y-6">
                        <div className="rounded bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold">素早さ順</h3>
                                <p className="text-xs text-gray-500">
                                    ← 速い　遅い →
                                </p>
                            </div>

                            {renderPokemonIconRanking(
                                opponentAnalysis.speedRanking,
                                "S",
                            )}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded bg-gray-50 p-4">
                                <h3 className="font-bold">
                                    物理火力 A 上位3匹
                                </h3>
                                {renderPokemonIconRanking(
                                    opponentAnalysis.attackTop3,
                                    "A",
                                )}
                            </div>

                            <div className="rounded bg-gray-50 p-4">
                                <h3 className="font-bold">
                                    特殊火力 C 上位3匹
                                </h3>
                                {renderPokemonIconRanking(
                                    opponentAnalysis.specialAttackTop3,
                                    "C",
                                )}
                            </div>
                        </div>

                        <div className="rounded bg-gray-50 p-4">
                            <h3 className="font-bold">火力傾向</h3>
                            <p className="mt-1 text-sm text-gray-700">
                                {opponentAnalysis.attackBiasLabel}
                            </p>

                            {renderRatioBar(
                                "攻撃",
                                opponentAnalysis.attackRate,
                                "特攻",
                                opponentAnalysis.specialAttackRate,
                            )}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded bg-gray-50 p-4">
                                <h3 className="font-bold">
                                    物理耐久 B 上位3匹
                                </h3>
                                {renderPokemonIconRanking(
                                    opponentAnalysis.defenseTop3,
                                    "B",
                                )}
                            </div>

                            <div className="rounded bg-gray-50 p-4">
                                <h3 className="font-bold">
                                    特殊耐久 D 上位3匹
                                </h3>
                                {renderPokemonIconRanking(
                                    opponentAnalysis.specialDefenseTop3,
                                    "D",
                                )}
                            </div>
                        </div>

                        <div className="rounded bg-gray-50 p-4">
                            <h3 className="font-bold">耐久傾向</h3>
                            <p className="mt-1 text-sm text-gray-700">
                                {opponentAnalysis.defenseBiasLabel}
                            </p>

                            {renderRatioBar(
                                "防御",
                                opponentAnalysis.defenseRate,
                                "特防",
                                opponentAnalysis.specialDefenseRate,
                            )}
                        </div>
                    </div>
                )}
            </section>

            <section className="mt-8 rounded border p-6">
                <h2 className="text-xl font-bold">自分側の選出候補</h2>
                <p className="mt-1 text-sm text-gray-600">
                    保存済み基本選出と、役割タグからの自動提案を見ながら選出を考えます。
                </p>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded bg-gray-50 p-4">
                        <h3 className="font-bold">保存済み基本選出</h3>

                        {savedSelectionTemplates.length > 0 ? (
                            <div className="mt-4 space-y-4">
                                {savedSelectionTemplates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="rounded bg-white p-4"
                                    >
                                        <p className="font-semibold">
                                            {template.name}
                                        </p>

                                        {template.memo && (
                                            <p className="mt-1 text-sm text-gray-600">
                                                {template.memo}
                                            </p>
                                        )}

                                        <div className="mt-3 grid gap-2 text-sm">
                                            <div className="flex justify-between rounded border p-2">
                                                <span className="text-gray-500">
                                                    初手
                                                </span>
                                                <span className="font-medium">
                                                    {getPartyPokemonDisplayName(
                                                        template.lead_pokemon,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between rounded border p-2">
                                                <span className="text-gray-500">
                                                    引き先
                                                </span>
                                                <span className="font-medium">
                                                    {getPartyPokemonDisplayName(
                                                        template.switch_pokemon,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between rounded border p-2">
                                                <span className="text-gray-500">
                                                    勝ち筋
                                                </span>
                                                <span className="font-medium">
                                                    {getPartyPokemonDisplayName(
                                                        template.finisher_pokemon,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                                まだ保存済み基本選出がありません。
                            </p>
                        )}
                    </div>

                    <div className="rounded bg-gray-50 p-4">
                        <h3 className="font-bold">自動おすすめ基本選出</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            現在の役割タグ点数から自動提案しています。
                        </p>

                        {currentPokemonList.length >= 3 ? (
                            <div className="mt-4 space-y-3">
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
                                            className="rounded bg-white p-4"
                                        >
                                            <p className="text-xs font-semibold text-gray-500">
                                                {suggestion.label}
                                            </p>

                                            {suggestion.pokemon ? (
                                                <div className="mt-2 flex items-center gap-3">
                                                    {pokemonMaster?.image_url ? (
                                                        <img
                                                            src={
                                                                pokemonMaster.image_url
                                                            }
                                                            alt={
                                                                pokemonMaster.name
                                                            }
                                                            className="h-12 w-12 object-contain"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-sm">
                                                            ?
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="font-semibold">
                                                            {suggestion.pokemon
                                                                .nickname ||
                                                                pokemonMaster?.name ||
                                                                suggestion
                                                                    .pokemon
                                                                    .pokemon_key}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-600">
                                                            {suggestion.reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    候補がありません。
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                                自動提案には自分のポケモンを3匹以上登録してください。
                            </p>
                        )}
                    </div>
                </div>
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
