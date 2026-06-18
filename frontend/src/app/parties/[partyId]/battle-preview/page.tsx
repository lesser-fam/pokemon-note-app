"use client";

import { NextBattleActionSuggestions } from "@/features/battlePreview/components/NextBattleActionSuggestions";
import { OpponentPartyColumn } from "@/features/battlePreview/components/OpponentPartyColumn";
import { OwnPartyColumn } from "@/features/battlePreview/components/OwnPartyColumn";
import { analyzeOpponentParty } from "@/features/battlePreview/utils/analyzeOpponentParty";
import { analyzeOpponentWeakness } from "@/features/battlePreview/utils/analyzeOpponentWeakness";
import {
    findDefaultForm,
    isMegaForm,
} from "@/features/battlePreview/utils/megaEvolution";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchPokemonAbilityWarnings } from "@/features/master/api/pokemonAbilityWarningApi";
import { fetchPokemonCommonMoves } from "@/features/pokemonCommonMoves/api/pokemonCommonMoveApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { PokemonSearchSelector } from "@/features/partyPokemon/components/PokemonSearchSelector";
import { calculateDefensiveMatchupScore } from "@/features/selections/utils/calculateDefensiveMatchupScore";
import { calculateOffensiveMatchupScore } from "@/features/selections/utils/calculateOffensiveMatchupScore";
import { suggestBasicSelection } from "@/features/selections/utils/suggestBasicSelection";
import { suggestMatchupSelections } from "@/features/selections/utils/suggestMatchupSelections";
import type { Party, PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonAbilityWarning } from "@/types/pokemonAbilityWarning";
import type { PokemonCommonMove } from "@/types/pokemonCommonMove";
import { getPartyRuleConfig } from "@/features/pokemonRules/partyRuleConfig";
import { isPokemonAvailableForRule } from "@/features/pokemonRules/isPokemonAvailableForRule";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";

//ルール別ポケモン確認用
// import { convertChampionsDexNumbersToIdentifiers } from "@/features/pokemonRules/tmp/convertChampionsPokemon";

type ComparisonMode =
    | "speed"
    | "own_attack_vs_opponent_defense"
    | "own_defense_vs_opponent_attack"
    | "own_special_attack_vs_opponent_special_defense"
    | "own_special_defense_vs_opponent_special_attack"
    | null;

type PokemonAbilityCandidate = PokemonAbilityWarning["abilities"][number];

export default function BattlePreviewPage() {
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [opponentPokemonList, setOpponentPokemonList] = useState<Pokemon[]>(
        [],
    );
    const ruleConfig = getPartyRuleConfig(party?.rule ?? "main_series");

    const [pokemonAbilityWarnings, setPokemonAbilityWarnings] = useState<
        PokemonAbilityWarning[]
    >([]);

    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const [selectedPartyPokemonIds, setSelectedPartyPokemonIds] = useState<
        number[]
    >([]);

    const [ownPokemonFormOverrides, setOwnPokemonFormOverrides] = useState<
        Record<number, string>
    >({});
    const [ownPokemonAbilityOverrides, setOwnPokemonAbilityOverrides] =
        useState<Record<number, PokemonAbilityCandidate | null>>({});
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>(null);

    const [actionOwnPokemonId, setActionOwnPokemonId] = useState<number | null>(
        null,
    );
    const [actionOpponentPokemonKey, setActionOpponentPokemonKey] = useState<
        string | null
    >(null);

    const [pokemonCommonMoves, setPokemonCommonMoves] = useState<
        PokemonCommonMove[]
    >([]);

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

    //確認用
    // useEffect(() => {
    //     if (pokemonList.length === 0) {
    //         return;
    //     }

    //     const result = convertChampionsDexNumbersToIdentifiers(pokemonList);

    //     console.log("sourceCount", result.sourceCount);
    //     console.log("matchedCount", result.matchedCount);
    //     console.log("missingCount", result.missingCount);
    //     console.log("missingDexNumbers", result.missingDexNumbers);
    //     console.log("matchedPokemon", result.matchedPokemon);
    //     console.log("matched", result.matched);
    // }, [pokemonList]);

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

    useEffect(() => {
        const loadPokemonCommonMoves = async () => {
            if (opponentPokemonList.length === 0) {
                setPokemonCommonMoves([]);
                return;
            }

            try {
                const commonMovesList = await Promise.all(
                    opponentPokemonList.map((pokemon) =>
                        fetchPokemonCommonMoves({
                            pokemonKey: pokemon.key,
                            formKey: pokemon.form_key,
                        }),
                    ),
                );

                setPokemonCommonMoves(commonMovesList.flat());
            } catch (error) {
                console.error(error);
                setPokemonCommonMoves([]);
            }
        };

        loadPokemonCommonMoves();
    }, [opponentPokemonList]);

    const resetOtherOpponentMegaForms = (
        currentList: Pokemon[],
        excludedPokemonKey?: string,
    ): Pokemon[] => {
        return currentList.map((pokemon) => {
            if (pokemon.key === excludedPokemonKey) {
                return pokemon;
            }

            if (!isMegaForm(pokemon)) {
                return pokemon;
            }

            return findDefaultForm(pokemonList, pokemon.key) ?? pokemon;
        });
    };

    const handleAddOpponentPokemon = (pokemon: Pokemon) => {
        if (opponentPokemonList.length >= ruleConfig.partyPokemonLimit) {
            return;
        }

        const alreadySelected = opponentPokemonList.some(
            (selectedPokemon) => selectedPokemon.key === pokemon.key,
        );

        if (alreadySelected) {
            return;
        }

        setOpponentPokemonList((currentList) => {
            const nextList = isMegaForm(pokemon)
                ? resetOtherOpponentMegaForms(currentList)
                : currentList;

            return [...nextList, pokemon];
        });
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

        setActionOpponentPokemonKey((currentKey) => {
            if (currentKey === pokemon.key) {
                return null;
            }

            return currentKey;
        });
    };

    const handleTogglePartyPokemonSelection = (partyPokemonId: number) => {
        setSelectedPartyPokemonIds((currentIds) => {
            if (currentIds.includes(partyPokemonId)) {
                return currentIds.filter((id) => id !== partyPokemonId);
            }

            if (currentIds.length >= ruleConfig.selectionPokemonLimit) {
                return currentIds;
            }

            return [...currentIds, partyPokemonId];
        });
    };

    const handleToggleActionOwnPokemon = (partyPokemonId: number) => {
        setActionOwnPokemonId((currentId) =>
            currentId === partyPokemonId ? null : partyPokemonId,
        );
    };

    const handleToggleActionOpponentPokemon = (pokemon: Pokemon) => {
        setActionOpponentPokemonKey((currentKey) =>
            currentKey === pokemon.key ? null : pokemon.key,
        );
    };

    const handleToggleComparisonMode = (
        nextMode: Exclude<ComparisonMode, null>,
    ) => {
        setComparisonMode((currentMode) =>
            currentMode === nextMode ? null : nextMode,
        );
    };

    const handleChangeOwnPokemonForm = async (
        partyPokemonId: number,
        nextPokemon: Pokemon,
    ) => {
        const originalPartyPokemon = currentPokemonList.find(
            (partyPokemon) => partyPokemon.id === partyPokemonId,
        );

        if (!originalPartyPokemon) {
            return;
        }

        const isNextMegaForm = isMegaForm(nextPokemon);

        setOwnPokemonFormOverrides((currentOverrides) => {
            const nextOverrides = {
                ...currentOverrides,
            };

            if (isNextMegaForm) {
                currentPokemonList.forEach((partyPokemon) => {
                    if (partyPokemon.id === partyPokemonId) {
                        return;
                    }

                    delete nextOverrides[partyPokemon.id];
                });
            }

            if (nextPokemon.form_key === originalPartyPokemon.form_key) {
                delete nextOverrides[partyPokemonId];

                return nextOverrides;
            }

            nextOverrides[partyPokemonId] = nextPokemon.form_key;

            return nextOverrides;
        });

        if (isNextMegaForm) {
            setOwnPokemonAbilityOverrides((currentOverrides) => {
                const nextOverrides = {
                    ...currentOverrides,
                };

                currentPokemonList.forEach((partyPokemon) => {
                    if (partyPokemon.id === partyPokemonId) {
                        return;
                    }

                    delete nextOverrides[partyPokemon.id];
                });

                return nextOverrides;
            });
        }

        if (nextPokemon.form_key === originalPartyPokemon.form_key) {
            setOwnPokemonAbilityOverrides((currentOverrides) => {
                const nextOverrides = {
                    ...currentOverrides,
                };

                delete nextOverrides[partyPokemonId];

                return nextOverrides;
            });

            return;
        }

        try {
            const data = await fetchPokemonAbilityWarnings([
                `${nextPokemon.key}:${nextPokemon.form_key}`,
            ]);

            const abilityCandidates = data[0]?.abilities ?? [];

            const temporaryAbility =
                abilityCandidates.length === 1 ? abilityCandidates[0] : null;

            setOwnPokemonAbilityOverrides((currentOverrides) => ({
                ...currentOverrides,
                [partyPokemonId]: temporaryAbility,
            }));
        } catch (error) {
            console.error(error);

            setOwnPokemonAbilityOverrides((currentOverrides) => ({
                ...currentOverrides,
                [partyPokemonId]: null,
            }));
        }
    };

    const handleChangeOpponentPokemonForm = (
        currentPokemon: Pokemon,
        nextPokemon: Pokemon,
    ) => {
        setOpponentPokemonList((currentList) => {
            const baseList = isMegaForm(nextPokemon)
                ? resetOtherOpponentMegaForms(currentList, currentPokemon.key)
                : currentList;

            return baseList.map((pokemon) =>
                pokemon.key === currentPokemon.key ? nextPokemon : pokemon,
            );
        });
    };

    const ownHighlightedStats =
        comparisonMode === "speed"
            ? ["s" as const]
            : comparisonMode === "own_attack_vs_opponent_defense"
              ? ["a" as const]
              : comparisonMode === "own_defense_vs_opponent_attack"
                ? ["b" as const]
                : comparisonMode ===
                    "own_special_attack_vs_opponent_special_defense"
                  ? ["c" as const]
                  : comparisonMode ===
                      "own_special_defense_vs_opponent_special_attack"
                    ? ["d" as const]
                    : [];

    const opponentHighlightedStats =
        comparisonMode === "speed"
            ? ["s" as const]
            : comparisonMode === "own_attack_vs_opponent_defense"
              ? ["b" as const]
              : comparisonMode === "own_defense_vs_opponent_attack"
                ? ["a" as const]
                : comparisonMode ===
                    "own_special_attack_vs_opponent_special_defense"
                  ? ["d" as const]
                  : comparisonMode ===
                      "own_special_defense_vs_opponent_special_attack"
                    ? ["c" as const]
                    : [];

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
            <div className="mt-2 flex flex-wrap gap-2">
                {pokemonList.map((pokemon) => (
                    <div
                        key={`${pokemon.key}-${pokemon.form_key}-${valueLabel}`}
                        className="rounded bg-white px-2 py-1.5 text-center"
                    >
                        {pokemon.image_url ? (
                            <img
                                src={pokemon.image_url}
                                alt={pokemon.name}
                                className="mx-auto h-10 w-10 object-contain"
                            />
                        ) : (
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xs">
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

    const getPokemonAbilities = (pokemon: Pokemon) => {
        const pokemonAbilityData = pokemonAbilityWarnings.find(
            (item) =>
                item.pokemon_key === pokemon.key &&
                item.form_key === pokemon.form_key,
        );

        return pokemonAbilityData?.abilities ?? [];
    };

    const currentPokemonList = party?.current_version?.pokemon ?? [];

    const effectiveCurrentPokemonList = currentPokemonList.map(
        (partyPokemon) => {
            const overriddenFormKey = ownPokemonFormOverrides[partyPokemon.id];

            const hasAbilityOverride = Object.prototype.hasOwnProperty.call(
                ownPokemonAbilityOverrides,
                partyPokemon.id,
            );

            const overriddenAbility =
                ownPokemonAbilityOverrides[partyPokemon.id];

            return {
                ...partyPokemon,

                form_key: overriddenFormKey ?? partyPokemon.form_key,

                ability: hasAbilityOverride
                    ? (overriddenAbility?.name ?? "")
                    : partyPokemon.ability,

                ability_id: hasAbilityOverride
                    ? (overriddenAbility?.id ?? null)
                    : partyPokemon.ability_id,

                ability_master: hasAbilityOverride
                    ? overriddenAbility
                    : partyPokemon.ability_master,
            };
        },
    );

    const offensiveMatchupResults = effectiveCurrentPokemonList
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

    const defensiveMatchupResults = effectiveCurrentPokemonList
        .map((partyPokemon) => {
            const pokemonMaster = findPokemonMaster({
                pokemonList,
                pokemonKey: partyPokemon.pokemon_key,
                formKey: partyPokemon.form_key,
            });

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

    const suggestedSelection = suggestBasicSelection(
        effectiveCurrentPokemonList,
    );
    const savedSelectionTemplates =
        party?.current_version?.selection_templates ?? [];
    const battleLogs = party?.current_version?.battle_logs ?? [];

    const matchupSelectionSuggestions = suggestMatchupSelections({
        partyPokemonList: effectiveCurrentPokemonList,
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

    const opponentQuery = opponentPokemonList
        .map((pokemon) => `${pokemon.key}:${pokemon.form_key}`)
        .join(",");

    const selectedQuery = selectedPartyPokemonIds.join(",");

    const battleLogCreateHref =
        `/parties/${party.id}/battle-logs/create` +
        `?opponents=${opponentQuery}` +
        `&selected=${selectedQuery}`;

    const canCreateBattleLog =
        opponentPokemonList.length > 0 &&
        selectedPartyPokemonIds.length === ruleConfig.selectionPokemonLimit;

    const getPartyPokemonDisplayName = (partyPokemon?: PartyPokemon | null) => {
        if (!partyPokemon) {
            return "未設定";
        }

        const pokemonMaster = findPokemonMaster({
            pokemonList,
            pokemonKey: partyPokemon.pokemon_key,
            formKey: partyPokemon.form_key,
        });

        return (
            partyPokemon.nickname ||
            pokemonMaster?.name ||
            partyPokemon.pokemon_key
        );
    };

    const renderSuggestedSelectionPokemon = (
        label: string,
        partyPokemon: PartyPokemon,
    ) => {
        const pokemonMaster = findPokemonMaster({
            pokemonList,
            pokemonKey: partyPokemon.pokemon_key,
            formKey: partyPokemon.form_key,
        });

        return (
            <div className="rounded bg-white px-2 py-1.5">
                <p className="text-[10px] font-semibold text-gray-500">
                    {label}
                </p>

                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                    {pokemonMaster?.image_url ? (
                        <img
                            src={pokemonMaster.image_url}
                            alt={pokemonMaster.name}
                            className="h-8 w-8 shrink-0 object-contain"
                        />
                    ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400">
                            ?
                        </div>
                    )}

                    <p className="min-w-0 truncate text-xs font-bold">
                        {getPartyPokemonDisplayName(partyPokemon)}
                    </p>
                </div>
            </div>
        );
    };

    const actionOwnPartyPokemon =
        effectiveCurrentPokemonList.find(
            (partyPokemon) => partyPokemon.id === actionOwnPokemonId,
        ) ?? null;

    const actionOwnPokemonMaster = actionOwnPartyPokemon
        ? (findPokemonMaster({
              pokemonList,
              pokemonKey: actionOwnPartyPokemon.pokemon_key,
              formKey: actionOwnPartyPokemon.form_key,
          }) ?? null)
        : null;

    const actionOpponentPokemon =
        opponentPokemonList.find(
            (pokemon) => pokemon.key === actionOpponentPokemonKey,
        ) ?? null;

    return (
        <main className="mx-auto max-w-450 p-6">
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(19rem,1fr)_minmax(0,1.35fr)_minmax(19rem,1fr)]">
                <div className="xl:sticky xl:top-4">
                    <OwnPartyColumn
                        partyPokemonList={effectiveCurrentPokemonList}
                        pokemonList={pokemonList}
                        selectedPartyPokemonIds={selectedPartyPokemonIds}
                        highlightedStats={ownHighlightedStats}
                        findPokemonMaster={(pokemonKey, formKey) =>
                            findPokemonMaster({
                                pokemonList,
                                pokemonKey,
                                formKey,
                            })
                        }
                        onToggleSelection={handleTogglePartyPokemonSelection}
                        onChangeForm={handleChangeOwnPokemonForm}
                        actionTargetPartyPokemonId={actionOwnPokemonId}
                        onSelectActionTarget={handleToggleActionOwnPokemon}
                    />
                </div>

                <div className="min-w-0 space-y-3 xl:max-h-[calc(100vh-1rem)] xl:overflow-y-auto xl:pr-1">
                    <section className="rounded border bg-white px-3 py-2">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <Link
                                href={`/parties/${party.id}`}
                                className="text-xs text-blue-600"
                            >
                                ← パーティ詳細へ戻る
                            </Link>

                            <h1 className="text-base font-bold">対戦前選出</h1>

                            <p className="text-xs text-gray-500">
                                相手の6匹を入力して、選出判断の準備をします。
                            </p>
                        </div>
                    </section>

                    <section className="rounded border bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold">
                                    相手ポケモンを探す
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    相手パーティへ追加するポケモンを選択してください。
                                </p>
                            </div>

                            <p className="text-sm font-medium text-gray-600">
                                {opponentPokemonList.length} /{" "}
                                {ruleConfig.partyPokemonLimit}
                            </p>
                        </div>

                        <div className="mt-4">
                            <PokemonSearchSelector
                                layout="compact"
                                pokemonList={pokemonList}
                                searchKeyword={searchKeyword}
                                onChangeSearchKeyword={setSearchKeyword}
                                clearSearchKeywordOnSelect
                                selectedTypes={selectedTypes}
                                onChangeSelectedTypes={setSelectedTypes}
                                isPokemonSelected={(pokemon) =>
                                    opponentPokemonList.some(
                                        (selectedPokemon) =>
                                            selectedPokemon.key === pokemon.key,
                                    )
                                }
                                isPokemonDisabled={(pokemon) =>
                                    opponentPokemonList.length >=
                                        ruleConfig.partyPokemonLimit ||
                                    opponentPokemonList.some(
                                        (selectedPokemon) =>
                                            selectedPokemon.key === pokemon.key,
                                    )
                                }
                                getPokemonStatusLabel={(pokemon) =>
                                    opponentPokemonList.some(
                                        (selectedPokemon) =>
                                            selectedPokemon.key === pokemon.key,
                                    )
                                        ? "選択済み"
                                        : null
                                }
                                onSelectPokemon={(pokemon) =>
                                    handleAddOpponentPokemon(pokemon)
                                }
                                filterPokemon={(pokemon) =>
                                    isPokemonAvailableForRule(
                                        pokemon,
                                        party?.rule,
                                    )
                                }
                            />
                        </div>
                    </section>

                    <section className="rounded border bg-white p-3">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-base font-bold">
                                おすすめ選出β
                            </h2>

                            <span className="text-[10px] text-gray-400">
                                相手の型は未確定
                            </span>
                        </div>

                        <p className="mt-1 text-[11px] text-gray-500">
                            攻撃相性、防御相性、特性、持ち物、役割、素早さ、保存済み基本選出、過去ログから簡易採点しています。
                        </p>

                        {opponentPokemonList.length === 0 ? (
                            <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                相手ポケモンを入力すると、おすすめ選出が表示されます。
                            </p>
                        ) : currentPokemonList.length <
                          ruleConfig.selectionPokemonLimit ? (
                            <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                おすすめ選出を表示するには、自分のポケモンを
                                {ruleConfig.selectionPokemonLimit}
                                匹以上登録してください。
                            </p>
                        ) : (
                            <div className="mt-2 space-y-2">
                                {matchupSelectionSuggestions.map(
                                    (suggestion, index) => (
                                        <div
                                            key={`${suggestion.leadPokemon.id}-${suggestion.switchPokemon.id}-${suggestion.finisherPokemon.id}`}
                                            className="rounded border bg-gray-50 p-2"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold">
                                                        {index + 1}位
                                                    </h3>

                                                    <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold">
                                                        {suggestion.totalScore}
                                                        点
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedPartyPokemonIds(
                                                            [
                                                                suggestion
                                                                    .leadPokemon
                                                                    .id,
                                                                suggestion
                                                                    .switchPokemon
                                                                    .id,
                                                                suggestion
                                                                    .finisherPokemon
                                                                    .id,
                                                            ],
                                                        )
                                                    }
                                                    className="rounded bg-black px-2 py-1 text-xs text-white hover:bg-gray-800"
                                                >
                                                    これにする
                                                </button>
                                            </div>

                                            <div className="mt-2 grid grid-cols-3 gap-1.5">
                                                {renderSuggestedSelectionPokemon(
                                                    "初手",
                                                    suggestion.leadPokemon,
                                                )}

                                                {renderSuggestedSelectionPokemon(
                                                    "引き先",
                                                    suggestion.switchPokemon,
                                                )}

                                                {renderSuggestedSelectionPokemon(
                                                    "勝ち筋",
                                                    suggestion.finisherPokemon,
                                                )}
                                            </div>

                                            <details className="mt-1.5">
                                                <summary className="cursor-pointer text-[11px] text-blue-600">
                                                    点数の内訳を見る
                                                </summary>

                                                <div className="mt-2 grid gap-1.5 text-[10px] text-gray-600 md:grid-cols-3">
                                                    <div className="rounded bg-white p-2">
                                                        <p className="font-semibold">
                                                            初手
                                                        </p>

                                                        <p className="mt-1">
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

                                                    <div className="rounded bg-white p-2">
                                                        <p className="font-semibold">
                                                            引き先
                                                        </p>

                                                        <p className="mt-1">
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

                                                    <div className="rounded bg-white p-2">
                                                        <p className="font-semibold">
                                                            勝ち筋
                                                        </p>

                                                        <p className="mt-1">
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
                                                    <p className="mt-2 text-[10px] font-medium text-blue-700">
                                                        保存済み基本選出との一致：+
                                                        {
                                                            suggestion.savedTemplateBonus
                                                        }
                                                        点
                                                    </p>
                                                )}

                                                {suggestion.reasons.length >
                                                    0 && (
                                                    <ul className="mt-2 space-y-0.5 text-[10px] text-gray-600">
                                                        {suggestion.reasons.map(
                                                            (reason) => (
                                                                <li
                                                                    key={reason}
                                                                >
                                                                    ・{reason}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                )}
                                            </details>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </section>

                    <section className="rounded border bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-sm font-bold">能力値を比較</h2>

                            <div className="text-[10px] text-gray-400">
                                H：HP / A：攻撃 / B：防御 / C：特攻 / D：特防 /
                                S：素早さ
                            </div>
                        </div>

                        <div className="mt-2 grid grid-cols-5 gap-1">
                            {[
                                {
                                    mode: "speed",
                                    label: "S比較",
                                },
                                {
                                    mode: "own_attack_vs_opponent_defense",
                                    label: "A → B",
                                },
                                {
                                    mode: "own_defense_vs_opponent_attack",
                                    label: "B ← A",
                                },
                                {
                                    mode: "own_special_attack_vs_opponent_special_defense",
                                    label: "C → D",
                                },
                                {
                                    mode: "own_special_defense_vs_opponent_special_attack",
                                    label: "D ← C",
                                },
                            ].map((comparison) => {
                                const isSelected =
                                    comparisonMode === comparison.mode;

                                return (
                                    <button
                                        key={comparison.mode}
                                        type="button"
                                        onClick={() =>
                                            handleToggleComparisonMode(
                                                comparison.mode as Exclude<
                                                    ComparisonMode,
                                                    null
                                                >,
                                            )
                                        }
                                        className={`rounded border px-1 py-1 text-xs ${
                                            isSelected
                                                ? "border-black bg-black text-white"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        {comparison.label}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <NextBattleActionSuggestions
                        ownPartyPokemon={actionOwnPartyPokemon}
                        ownPokemonMaster={actionOwnPokemonMaster}
                        opponentPokemon={actionOpponentPokemon}
                        partyPokemonList={effectiveCurrentPokemonList}
                        pokemonMasterList={pokemonList}
                        selectedPartyPokemonIds={selectedPartyPokemonIds}
                        pokemonCommonMoves={pokemonCommonMoves}
                    />

                    <section className="sticky bottom-0 z-10 rounded border bg-white/95 p-3 shadow-sm backdrop-blur">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-bold">選出を決めたら</h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    相手パーティと、自分の選出
                                    {ruleConfig.selectionPokemonLimit}
                                    匹を引き継いで対戦ログ作成画面へ進みます。
                                </p>

                                {opponentPokemonList.length === 0 && (
                                    <p className="mt-2 text-xs text-red-600">
                                        相手ポケモンを1匹以上選んでください。
                                    </p>
                                )}

                                {selectedPartyPokemonIds.length <
                                    ruleConfig.selectionPokemonLimit && (
                                    <p className="mt-1 text-xs text-red-600">
                                        自パーティから選出する
                                        {ruleConfig.selectionPokemonLimit}
                                        匹を選んでください。
                                    </p>
                                )}
                            </div>

                            <Link
                                href={battleLogCreateHref}
                                className={`rounded px-4 py-2 text-sm text-white ${
                                    canCreateBattleLog
                                        ? "bg-black hover:bg-gray-800"
                                        : "pointer-events-none bg-gray-400"
                                }`}
                            >
                                対戦ログ作成へ
                            </Link>
                        </div>
                    </section>

                    <details className="rounded border bg-white p-3">
                        <summary className="cursor-pointer text-sm font-bold">
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

                                        <div className="grid gap-3">
                                            <div className="rounded bg-gray-50 p-4">
                                                <h3 className="font-bold">
                                                    物理火力 A Top3
                                                </h3>
                                                {renderPokemonIconRanking(
                                                    opponentAnalysis.attackTop3,
                                                    "A",
                                                )}
                                            </div>

                                            <div className="rounded bg-gray-50 p-4">
                                                <h3 className="font-bold">
                                                    特殊火力 C Top3
                                                </h3>
                                                {renderPokemonIconRanking(
                                                    opponentAnalysis.specialAttackTop3,
                                                    "C",
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded bg-gray-50 p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <h3 className="font-bold">
                                                    火力傾向
                                                </h3>
                                                <p className="text-sm text-gray-700">
                                                    {
                                                        opponentAnalysis.attackBiasLabel
                                                    }
                                                </p>
                                            </div>

                                            {renderRatioBar(
                                                "攻撃",
                                                opponentAnalysis.attackRate,
                                                "特攻",
                                                opponentAnalysis.specialAttackRate,
                                            )}
                                        </div>

                                        <div className="grid gap-3">
                                            <div className="rounded bg-gray-50 p-4">
                                                <h3 className="font-bold">
                                                    物理耐久 B Top3
                                                </h3>
                                                {renderPokemonIconRanking(
                                                    opponentAnalysis.defenseTop3,
                                                    "B",
                                                )}
                                            </div>

                                            <div className="rounded bg-gray-50 p-4">
                                                <h3 className="font-bold">
                                                    特殊耐久 D Top3
                                                </h3>
                                                {renderPokemonIconRanking(
                                                    opponentAnalysis.specialDefenseTop3,
                                                    "D",
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded bg-gray-50 p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <h3 className="font-bold">
                                                    耐久傾向
                                                </h3>
                                                <p className="text-sm text-gray-700">
                                                    {
                                                        opponentAnalysis.defenseBiasLabel
                                                    }
                                                </p>
                                            </div>

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
                                                    findPokemonMaster({
                                                        pokemonList,
                                                        pokemonKey:
                                                            partyPokemon.pokemon_key,
                                                        formKey:
                                                            partyPokemon.form_key,
                                                    });

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
                                                    findPokemonMaster({
                                                        pokemonList,
                                                        pokemonKey:
                                                            partyPokemon.pokemon_key,
                                                        formKey:
                                                            partyPokemon.form_key,
                                                    });

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

                                        {currentPokemonList.length >=
                                        ruleConfig.selectionPokemonLimit ? (
                                            <div className="mt-4 space-y-3">
                                                {suggestedSelection.map(
                                                    (suggestion) => {
                                                        const pokemonMaster =
                                                            suggestion.pokemon
                                                                ? findPokemonMaster(
                                                                      {
                                                                          pokemonList,
                                                                          pokemonKey:
                                                                              suggestion
                                                                                  .pokemon
                                                                                  .pokemon_key,
                                                                          formKey:
                                                                              suggestion
                                                                                  .pokemon
                                                                                  .form_key,
                                                                      },
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
                                                自動提案には自分のポケモンを
                                                {
                                                    ruleConfig.selectionPokemonLimit
                                                }
                                                匹以上登録してください。
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
                        pokemonList={pokemonList}
                        highlightedStats={opponentHighlightedStats}
                        getPokemonAbilities={getPokemonAbilities}
                        onRemove={handleRemoveOpponentPokemon}
                        onChangeForm={handleChangeOpponentPokemonForm}
                        actionTargetPokemonKey={actionOpponentPokemonKey}
                        onSelectActionTarget={handleToggleActionOpponentPokemon}
                    />
                </div>
            </div>
        </main>
    );
}
