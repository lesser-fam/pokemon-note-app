"use client";

import { pokemonTypes } from "@/constants/pokemonTypes";
import { OpponentPartyColumn } from "@/features/battlePreview/components/OpponentPartyColumn";
import { OwnPartyColumn } from "@/features/battlePreview/components/OwnPartyColumn";
import { analyzeOpponentParty } from "@/features/battlePreview/utils/analyzeOpponentParty";
import { analyzeOpponentWeakness } from "@/features/battlePreview/utils/analyzeOpponentWeakness";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchPokemonAbilityWarnings } from "@/features/master/api/pokemonAbilityWarningApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { calculateDefensiveMatchupScore } from "@/features/selections/utils/calculateDefensiveMatchupScore";
import { calculateOffensiveMatchupScore } from "@/features/selections/utils/calculateOffensiveMatchupScore";
import { suggestBasicSelection } from "@/features/selections/utils/suggestBasicSelection";
import { suggestMatchupSelections } from "@/features/selections/utils/suggestMatchupSelections";
import type { Party, PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonAbilityWarning } from "@/types/pokemonAbilityWarning";
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

    const [pokemonAbilityWarnings, setPokemonAbilityWarnings] = useState<
        PokemonAbilityWarning[]
    >([]);

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

    useEffect(() => {
        const loadPokemonAbilityWarnings = async () => {
            if (opponentPokemonList.length === 0) {
                setPokemonAbilityWarnings([]);
                return;
            }

            try {
                const pokemonKeys = opponentPokemonList.map(
                    (pokemon) => `${pokemon.key}:${pokemon.form_key}`,
                );

                const data = await fetchPokemonAbilityWarnings(pokemonKeys);

                setPokemonAbilityWarnings(data);
            } catch (error) {
                console.error(error);
                setPokemonAbilityWarnings([]);
            }
        };

        loadPokemonAbilityWarnings();
    }, [opponentPokemonList]);

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
            (selectedPokemon) => selectedPokemon.key === pokemon.key,
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

    const hasPokemonFilter =
        normalizedKeyword !== "" || selectedTypes.length > 0;

    const visiblePokemonList = hasPokemonFilter
        ? filteredPokemonList
        : filteredPokemonList.slice(0, 30);

    const opponentAnalysis = analyzeOpponentParty(opponentPokemonList);
    const opponentWeaknessAnalysis =
        analyzeOpponentWeakness(opponentPokemonList);

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

    const findPokemonMaster = (pokemonKey: string, formKey: string) => {
        return pokemonList.find(
            (pokemon) =>
                pokemon.key === pokemonKey && pokemon.form_key === formKey,
        );
    };

    const getPokemonAbilities = (pokemon: Pokemon) => {
        const pokemonAbilityData = pokemonAbilityWarnings.find(
            (item) =>
                item.pokemon_key === pokemon.key &&
                item.form_key === pokemon.form_key,
        );

        return pokemonAbilityData?.abilities ?? [];
    };

    const currentPokemonList = party?.current_version?.pokemon ?? [];

    const offensiveMatchupResults = currentPokemonList
        .map((partyPokemon) => {
            const moveTypes = [
                partyPokemon.move_1_type,
                partyPokemon.move_2_type,
                partyPokemon.move_3_type,
                partyPokemon.move_4_type,
            ].filter((moveType): moveType is string => Boolean(moveType));

            const matchupResult = calculateOffensiveMatchupScore({
                moveTypes,
                opponentPokemonList,
            });

            return {
                partyPokemon,
                matchupResult,
            };
        })
        .sort((a, b) => b.matchupResult.score - a.matchupResult.score);

    const defensiveMatchupResults = currentPokemonList
        .map((partyPokemon) => {
            const pokemonMaster = findPokemonMaster(
                partyPokemon.pokemon_key,
                partyPokemon.form_key,
            );

            const matchupResult = calculateDefensiveMatchupScore({
                defenderTypes: pokemonMaster?.types ?? [],
                opponentPokemonList,
                abilityEffectRules:
                    partyPokemon.ability_master?.effect_rules ?? [],
                itemEffectRules: partyPokemon.item_master?.effect_rules ?? [],
            });

            return {
                partyPokemon,
                matchupResult,
            };
        })
        .sort((a, b) => b.matchupResult.score - a.matchupResult.score);

    const suggestedSelection = suggestBasicSelection(currentPokemonList);
    const savedSelectionTemplates =
        party?.current_version?.selection_templates ?? [];
    const battleLogs = party?.current_version?.battle_logs ?? [];

    const matchupSelectionSuggestions = suggestMatchupSelections({
        partyPokemonList: currentPokemonList,
        pokemonMasterList: pokemonList,
        opponentPokemonList,
        savedSelectionTemplates,
        battleLogs,
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

    const battleLogCreateHref = `/parties/${party.id}/battle-logs/create?opponents=${opponentPokemonList
        .map((pokemon) => `${pokemon.key}:${pokemon.form_key}`)
        .join(",")}`;

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
        <main className="mx-auto max-w-450 p-6">
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(17rem,1fr)_minmax(0,1.5fr)_minmax(17rem,1fr)]">
                <div className="xl:sticky xl:top-4">
                    <OwnPartyColumn
                        partyPokemonList={currentPokemonList}
                        findPokemonMaster={findPokemonMaster}
                    />
                </div>

                <div className="min-w-0 space-y-6">
                    <section className="rounded border bg-white p-4">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <Link
                                href={`/parties/${party.id}`}
                                className="text-sm text-blue-600"
                            >
                                ← パーティ詳細へ戻る
                            </Link>

                            <h1 className="text-xl font-bold">対戦前選出</h1>

                            <p className="text-sm text-gray-600">
                                相手の6匹を入力して、選出判断の準備をします。
                            </p>
                        </div>
                    </section>

                    <section className="mt-8 rounded border p-6">
                        <h2 className="text-xl font-bold">
                            相手ポケモンを探す
                        </h2>

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
                            <p className="text-sm font-medium">
                                タイプで絞り込み
                            </p>

                            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                                {pokemonTypes.map((type) => {
                                    const isSelected =
                                        selectedTypes.includes(type);

                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                handleToggleType(type)
                                            }
                                            className={`rounded-full border px-2 py-1 text-xs ${
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
                                {!hasPokemonFilter &&
                                    filteredPokemonList.length >
                                        visiblePokemonList.length &&
                                    `初期表示 ${visiblePokemonList.length}件`}
                            </p>

                            {!hasPokemonFilter &&
                                filteredPokemonList.length >
                                    visiblePokemonList.length && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        ポケモン名の検索またはタイプ絞り込みで候補を探してください。
                                    </p>
                                )}
                        </div>

                        <div className="mt-4 max-h-88 overflow-y-auto rounded border bg-gray-50 p-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {visiblePokemonList.map((pokemon) => {
                                    const isSelected = opponentPokemonList.some(
                                        (selectedPokemon) =>
                                            selectedPokemon.key === pokemon.key,
                                    );

                                    return (
                                        <button
                                            key={`${pokemon.key}-${pokemon.form_key}`}
                                            type="button"
                                            onClick={() =>
                                                handleAddOpponentPokemon(
                                                    pokemon,
                                                )
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
                                                        {pokemon.types.join(
                                                            " / ",
                                                        )}
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
                        </div>

                        {filteredPokemonList.length === 0 && (
                            <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                条件に合うポケモンが見つかりません。
                            </p>
                        )}
                    </section>

                    <section className="mt-8 rounded border p-6">
                        <h2 className="text-xl font-bold">おすすめ選出β</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            攻撃相性、防御相性、特性、持ち物、役割タグ、素早さ、保存済み基本選出、過去ログから簡易採点しています。
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            相手の技構成や特性は未反映です。相手のタイプ一致技を基準にした簡易提案です。
                        </p>

                        {opponentPokemonList.length === 0 ? (
                            <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                相手ポケモンを入力すると、おすすめ選出が表示されます。
                            </p>
                        ) : currentPokemonList.length < 3 ? (
                            <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                おすすめ選出を表示するには、自分のポケモンを3匹以上登録してください。
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {matchupSelectionSuggestions.map(
                                    (suggestion, index) => (
                                        <div
                                            key={`${suggestion.leadPokemon.id}-${suggestion.switchPokemon.id}-${suggestion.finisherPokemon.id}`}
                                            className="rounded bg-gray-50 p-4"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <h3 className="font-bold">
                                                    {index + 1}位
                                                </h3>

                                                <span className="rounded bg-white px-3 py-1 text-sm font-semibold">
                                                    合計 {suggestion.totalScore}
                                                    点
                                                </span>
                                            </div>

                                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                                                <div className="rounded bg-white p-3">
                                                    <p className="text-xs font-semibold text-gray-500">
                                                        初手
                                                    </p>
                                                    <p className="mt-1 font-bold">
                                                        {getPartyPokemonDisplayName(
                                                            suggestion.leadPokemon,
                                                        )}
                                                    </p>
                                                    <p className="mt-2 text-xs text-gray-600">
                                                        役割タグ{" "}
                                                        {
                                                            suggestion
                                                                .leadBreakdown
                                                                .roleTagScore
                                                        }{" "}
                                                        / 攻撃{" "}
                                                        {
                                                            suggestion
                                                                .leadBreakdown
                                                                .offensiveScore
                                                        }{" "}
                                                        / 防御{" "}
                                                        {
                                                            suggestion
                                                                .leadBreakdown
                                                                .defensiveScore
                                                        }{" "}
                                                        / 素早さ{" "}
                                                        {
                                                            suggestion
                                                                .leadBreakdown
                                                                .speedScore
                                                        }{" "}
                                                        / 過去ログ{" "}
                                                        {
                                                            suggestion
                                                                .leadBreakdown
                                                                .battleLogScore
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded bg-white p-3">
                                                    <p className="text-xs font-semibold text-gray-500">
                                                        引き先
                                                    </p>
                                                    <p className="mt-1 font-bold">
                                                        {getPartyPokemonDisplayName(
                                                            suggestion.switchPokemon,
                                                        )}
                                                    </p>
                                                    <p className="mt-2 text-xs text-gray-600">
                                                        役割タグ{" "}
                                                        {
                                                            suggestion
                                                                .switchBreakdown
                                                                .roleTagScore
                                                        }{" "}
                                                        / 攻撃{" "}
                                                        {
                                                            suggestion
                                                                .switchBreakdown
                                                                .offensiveScore
                                                        }{" "}
                                                        / 防御{" "}
                                                        {
                                                            suggestion
                                                                .switchBreakdown
                                                                .defensiveScore
                                                        }{" "}
                                                        / 過去ログ{" "}
                                                        {
                                                            suggestion
                                                                .switchBreakdown
                                                                .battleLogScore
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded bg-white p-3">
                                                    <p className="text-xs font-semibold text-gray-500">
                                                        勝ち筋
                                                    </p>
                                                    <p className="mt-1 font-bold">
                                                        {getPartyPokemonDisplayName(
                                                            suggestion.finisherPokemon,
                                                        )}
                                                    </p>
                                                    <p className="mt-2 text-xs text-gray-600">
                                                        役割タグ{" "}
                                                        {
                                                            suggestion
                                                                .finisherBreakdown
                                                                .roleTagScore
                                                        }{" "}
                                                        / 攻撃{" "}
                                                        {
                                                            suggestion
                                                                .finisherBreakdown
                                                                .offensiveScore
                                                        }{" "}
                                                        / 防御{" "}
                                                        {
                                                            suggestion
                                                                .finisherBreakdown
                                                                .defensiveScore
                                                        }{" "}
                                                        / 素早さ{" "}
                                                        {
                                                            suggestion
                                                                .finisherBreakdown
                                                                .speedScore
                                                        }{" "}
                                                        / 過去ログ{" "}
                                                        {
                                                            suggestion
                                                                .finisherBreakdown
                                                                .battleLogScore
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {suggestion.savedTemplateBonus >
                                                0 && (
                                                <p className="mt-3 text-xs font-medium text-blue-700">
                                                    保存済み基本選出との一致：+
                                                    {
                                                        suggestion.savedTemplateBonus
                                                    }
                                                    点
                                                </p>
                                            )}

                                            {suggestion.reasons.length > 0 && (
                                                <ul className="mt-3 space-y-1 text-xs text-gray-600">
                                                    {suggestion.reasons.map(
                                                        (reason) => (
                                                            <li key={reason}>
                                                                ・{reason}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </section>

                    <section className="rounded border bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-bold">選出を決めたら</h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    相手パーティを引き継いで、対戦ログ作成画面へ進みます。
                                </p>
                            </div>

                            <Link
                                href={battleLogCreateHref}
                                className={`rounded px-4 py-2 text-sm text-white ${
                                    opponentPokemonList.length === 0
                                        ? "pointer-events-none bg-gray-400"
                                        : "bg-black hover:bg-gray-800"
                                }`}
                            >
                                対戦ログ作成へ
                            </Link>
                        </div>
                    </section>

                    <details className="mt-8 rounded border p-6">
                        <summary className="cursor-pointer text-xl font-bold">
                            詳細分析を見る
                        </summary>

                        <div className="mt-6 space-y-8">
                            <section className="mt-8 rounded border p-6">
                                <h2 className="text-xl font-bold">
                                    相手パーティ簡易分析
                                </h2>
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
                                            <h3 className="font-bold">
                                                弱点傾向
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                相手パーティに通りやすい攻撃タイプです。
                                            </p>

                                            {opponentWeaknessAnalysis.length >
                                            0 ? (
                                                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                                    {opponentWeaknessAnalysis
                                                        .slice(0, 6)
                                                        .map((item) => (
                                                            <div
                                                                key={
                                                                    item.attackType
                                                                }
                                                                className="rounded bg-white p-4"
                                                            >
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div>
                                                                        <p className="font-bold">
                                                                            {
                                                                                item.attackType
                                                                            }
                                                                        </p>
                                                                        <p className="mt-1 text-sm text-gray-600">
                                                                            弱点{" "}
                                                                            {
                                                                                item.weakCount
                                                                            }
                                                                            匹
                                                                            {item.fourTimesWeakCount >
                                                                                0 &&
                                                                                ` / 4倍 ${item.fourTimesWeakCount}匹`}
                                                                            {item.immuneCount >
                                                                                0 &&
                                                                                ` / 無効 ${item.immuneCount}匹`}
                                                                        </p>
                                                                    </div>

                                                                    <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                                                                        スコア{" "}
                                                                        {
                                                                            item.totalScore
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div className="mt-3 space-y-3">
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-gray-500">
                                                                            弱点を突ける相手
                                                                        </p>

                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {item.targets.map(
                                                                                (
                                                                                    target,
                                                                                ) => (
                                                                                    <div
                                                                                        key={`${item.attackType}-weak-${target.key}-${target.form_key}`}
                                                                                        className="flex items-center gap-2 rounded bg-gray-50 px-2 py-1 text-xs"
                                                                                    >
                                                                                        {target.image_url && (
                                                                                            <img
                                                                                                src={
                                                                                                    target.image_url
                                                                                                }
                                                                                                alt={
                                                                                                    target.name
                                                                                                }
                                                                                                className="h-8 w-8 object-contain"
                                                                                            />
                                                                                        )}

                                                                                        <span>
                                                                                            {
                                                                                                target.name
                                                                                            }
                                                                                        </span>
                                                                                        <span className="font-semibold">
                                                                                            ×
                                                                                            {
                                                                                                target.multiplier
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {item
                                                                        .immuneTargets
                                                                        .length >
                                                                        0 && (
                                                                        <div>
                                                                            <p className="text-xs font-semibold text-red-600">
                                                                                無効にされる相手
                                                                            </p>

                                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                                {item.immuneTargets.map(
                                                                                    (
                                                                                        target,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={`${item.attackType}-immune-${target.key}-${target.form_key}`}
                                                                                            className="flex items-center gap-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700"
                                                                                        >
                                                                                            {target.image_url && (
                                                                                                <img
                                                                                                    src={
                                                                                                        target.image_url
                                                                                                    }
                                                                                                    alt={
                                                                                                        target.name
                                                                                                    }
                                                                                                    className="h-8 w-8 object-contain"
                                                                                                />
                                                                                            )}

                                                                                            <span>
                                                                                                {
                                                                                                    target.name
                                                                                                }
                                                                                            </span>
                                                                                            <span className="font-semibold">
                                                                                                ×0
                                                                                            </span>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                                                    弱点を突けるタイプがまだ見つかりません。
                                                </p>
                                            )}
                                        </div>

                                        <div className="rounded bg-gray-50 p-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold">
                                                    素早さ順
                                                </h3>
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
                                            <h3 className="font-bold">
                                                火力傾向
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-700">
                                                {
                                                    opponentAnalysis.attackBiasLabel
                                                }
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
                                            <h3 className="font-bold">
                                                耐久傾向
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-700">
                                                {
                                                    opponentAnalysis.defenseBiasLabel
                                                }
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
                                <h2 className="text-xl font-bold">
                                    自分側の攻撃相性
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    登録した攻撃技タイプを使い、相手ポケモンごとに最も通る技を基準として簡易採点します。
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    変化技は採点対象にしないため、技登録時に「タイプなし・変化技」を選択してください。
                                </p>

                                {opponentPokemonList.length === 0 ? (
                                    <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                        相手ポケモンを入力すると、攻撃相性点が表示されます。
                                    </p>
                                ) : currentPokemonList.length === 0 ? (
                                    <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                        自分のパーティにポケモンを登録してください。
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-4">
                                        {offensiveMatchupResults.map(
                                            ({
                                                partyPokemon,
                                                matchupResult,
                                            }) => {
                                                const pokemonMaster =
                                                    findPokemonMaster(
                                                        partyPokemon.pokemon_key,
                                                        partyPokemon.form_key,
                                                    );

                                                return (
                                                    <div
                                                        key={partyPokemon.id}
                                                        className="rounded bg-gray-50 p-4"
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                                            <div className="flex items-center gap-3">
                                                                {pokemonMaster?.image_url ? (
                                                                    <img
                                                                        src={
                                                                            pokemonMaster.image_url
                                                                        }
                                                                        alt={
                                                                            pokemonMaster.name
                                                                        }
                                                                        className="h-14 w-14 object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-14 w-14 items-center justify-center rounded bg-white text-sm">
                                                                        ?
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <p className="font-bold">
                                                                        {getPartyPokemonDisplayName(
                                                                            partyPokemon,
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-gray-600">
                                                                        弱点を突ける相手：
                                                                        {
                                                                            matchupResult.superEffectiveTargetCount
                                                                        }
                                                                        匹 /
                                                                        等倍以上：
                                                                        {
                                                                            matchupResult.neutralOrBetterTargetCount
                                                                        }
                                                                        匹
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <span className="rounded bg-white px-3 py-1 text-sm font-semibold">
                                                                攻撃相性点{" "}
                                                                {
                                                                    matchupResult.score
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {matchupResult.targets.map(
                                                                (target) => (
                                                                    <span
                                                                        key={`${partyPokemon.id}-${target.opponentKey}-${target.opponentFormKey}`}
                                                                        className={`rounded px-2 py-1 text-xs ${
                                                                            target.bestMultiplier >=
                                                                            2
                                                                                ? "bg-green-100 text-green-700"
                                                                                : target.bestMultiplier <
                                                                                    1
                                                                                  ? "bg-red-100 text-red-700"
                                                                                  : "bg-white text-gray-700"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            target.opponentName
                                                                        }
                                                                        ：{" "}
                                                                        {target.bestMoveType
                                                                            ? `${target.bestMoveType} ×${target.bestMultiplier}`
                                                                            : "攻撃技タイプ未登録"}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>

                                                        <ul className="mt-3 space-y-1 text-xs text-gray-600">
                                                            {matchupResult.reasons.map(
                                                                (reason) => (
                                                                    <li
                                                                        key={
                                                                            reason
                                                                        }
                                                                    >
                                                                        ・
                                                                        {reason}
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="mt-8 rounded border p-6">
                                <h2 className="text-xl font-bold">
                                    自分側の防御相性
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    相手ポケモンのタイプ一致技を想定し、自分側の受けやすさを簡易採点します。
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    実際の技構成や特性は未反映です。相手のタイプから推定しています。
                                </p>

                                {opponentPokemonList.length === 0 ? (
                                    <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                        相手ポケモンを入力すると、防御相性点が表示されます。
                                    </p>
                                ) : currentPokemonList.length === 0 ? (
                                    <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                        自分のパーティにポケモンを登録してください。
                                    </p>
                                ) : (
                                    <div className="mt-4 space-y-4">
                                        {defensiveMatchupResults.map(
                                            ({
                                                partyPokemon,
                                                matchupResult,
                                            }) => {
                                                const pokemonMaster =
                                                    findPokemonMaster(
                                                        partyPokemon.pokemon_key,
                                                        partyPokemon.form_key,
                                                    );

                                                return (
                                                    <div
                                                        key={partyPokemon.id}
                                                        className="rounded bg-gray-50 p-4"
                                                    >
                                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                                            <div className="flex items-center gap-3">
                                                                {pokemonMaster?.image_url ? (
                                                                    <img
                                                                        src={
                                                                            pokemonMaster.image_url
                                                                        }
                                                                        alt={
                                                                            pokemonMaster.name
                                                                        }
                                                                        className="h-14 w-14 object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-14 w-14 items-center justify-center rounded bg-white text-sm">
                                                                        ?
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <p className="font-bold">
                                                                        {getPartyPokemonDisplayName(
                                                                            partyPokemon,
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-gray-600">
                                                                        半減以下：
                                                                        {
                                                                            matchupResult.resistTargetCount
                                                                        }
                                                                        匹 /
                                                                        弱点：
                                                                        {
                                                                            matchupResult.weakTargetCount
                                                                        }
                                                                        匹
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <span className="rounded bg-white px-3 py-1 text-sm font-semibold">
                                                                防御相性点{" "}
                                                                {
                                                                    matchupResult.score
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {matchupResult.targets.map(
                                                                (target) => (
                                                                    <span
                                                                        key={`${partyPokemon.id}-${target.opponentKey}-${target.opponentFormKey}`}
                                                                        className={`rounded px-2 py-1 text-xs ${
                                                                            target.worstMultiplier >
                                                                            1
                                                                                ? "bg-red-100 text-red-700"
                                                                                : target.worstMultiplier <
                                                                                    1
                                                                                  ? "bg-green-100 text-green-700"
                                                                                  : "bg-white text-gray-700"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            target.opponentName
                                                                        }
                                                                        ：{" "}
                                                                        {target.worstAttackType
                                                                            ? `${target.worstAttackType} ×${target.worstMultiplier}`
                                                                            : "判定なし"}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>

                                                        <ul className="mt-3 space-y-1 text-xs text-gray-600">
                                                            {matchupResult.reasons.map(
                                                                (reason) => (
                                                                    <li
                                                                        key={
                                                                            reason
                                                                        }
                                                                    >
                                                                        ・
                                                                        {reason}
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="mt-8 rounded border p-6">
                                <h2 className="text-xl font-bold">
                                    自分側の選出候補
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    保存済み基本選出と、役割タグからの自動提案を見ながら選出を考えます。
                                </p>

                                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                                    <div className="rounded bg-gray-50 p-4">
                                        <h3 className="font-bold">
                                            保存済み基本選出
                                        </h3>

                                        {savedSelectionTemplates.length > 0 ? (
                                            <div className="mt-4 space-y-4">
                                                {savedSelectionTemplates.map(
                                                    (template) => (
                                                        <div
                                                            key={template.id}
                                                            className="rounded bg-white p-4"
                                                        >
                                                            <p className="font-semibold">
                                                                {template.name}
                                                            </p>

                                                            {template.memo && (
                                                                <p className="mt-1 text-sm text-gray-600">
                                                                    {
                                                                        template.memo
                                                                    }
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
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                                                まだ保存済み基本選出がありません。
                                            </p>
                                        )}
                                    </div>

                                    <div className="rounded bg-gray-50 p-4">
                                        <h3 className="font-bold">
                                            自動おすすめ基本選出
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-600">
                                            現在の役割タグ点数から自動提案しています。
                                        </p>

                                        {currentPokemonList.length >= 3 ? (
                                            <div className="mt-4 space-y-3">
                                                {suggestedSelection.map(
                                                    (suggestion) => {
                                                        const pokemonMaster =
                                                            suggestion.pokemon
                                                                ? findPokemonMaster(
                                                                      suggestion
                                                                          .pokemon
                                                                          .pokemon_key,
                                                                      suggestion
                                                                          .pokemon
                                                                          .form_key,
                                                                  )
                                                                : null;

                                                        return (
                                                            <div
                                                                key={
                                                                    suggestion.role
                                                                }
                                                                className="rounded bg-white p-4"
                                                            >
                                                                <p className="text-xs font-semibold text-gray-500">
                                                                    {
                                                                        suggestion.label
                                                                    }
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
                                                                                {suggestion
                                                                                    .pokemon
                                                                                    .nickname ||
                                                                                    pokemonMaster?.name ||
                                                                                    suggestion
                                                                                        .pokemon
                                                                                        .pokemon_key}
                                                                            </p>

                                                                            <p className="mt-1 text-xs text-gray-600">
                                                                                {
                                                                                    suggestion.reason
                                                                                }
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
                                                    },
                                                )}
                                            </div>
                                        ) : (
                                            <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                                                自動提案には自分のポケモンを3匹以上登録してください。
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </details>
                </div>

                <div className="xl:sticky xl:top-4">
                    <OpponentPartyColumn
                        opponentPokemonList={opponentPokemonList}
                        getPokemonAbilities={getPokemonAbilities}
                        onRemove={handleRemoveOpponentPokemon}
                    />
                </div>
            </div>
        </main>
    );
}
