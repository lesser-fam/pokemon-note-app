"use client";

import { PageStateMessage } from "@/components/pageStates/PageStateMessage";
import { BattleLogCreateNavigationSection } from "@/features/battlePreview/components/BattleLogCreateNavigationSection";
import { BattlePreviewHeader } from "@/features/battlePreview/components/BattlePreviewHeader";
import { MatchupSelectionSuggestionsSection } from "@/features/battlePreview/components/MatchupSelectionSuggestionsSection";
import { NextBattleActionSuggestions } from "@/features/battlePreview/components/NextBattleActionSuggestions";
import { OpponentPartyAnalysisSection } from "@/features/battlePreview/components/OpponentPartyAnalysisSection";
import { OpponentPartyColumn } from "@/features/battlePreview/components/OpponentPartyColumn";
import { OpponentPokemonSearchSection } from "@/features/battlePreview/components/OpponentPokemonSearchSection";
import { OwnPartyColumn } from "@/features/battlePreview/components/OwnPartyColumn";
import {
    StatComparisonModeSection,
    type ComparisonMode,
} from "@/features/battlePreview/components/StatComparisonModeSection";
import { analyzeOpponentParty } from "@/features/battlePreview/utils/analyzeOpponentParty";
import { analyzeOpponentWeakness } from "@/features/battlePreview/utils/analyzeOpponentWeakness";
import {
    findDefaultForm,
    isMegaForm,
} from "@/features/battlePreview/utils/megaEvolution";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchPokemonAbilityWarnings } from "@/features/master/api/pokemonAbilityWarningApi";
import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import { fetchParty } from "@/features/parties/api/partyApi";
import { fetchPokemonCommonMoves } from "@/features/pokemonCommonMoves/api/pokemonCommonMoveApi";
import { getPartyRuleConfig } from "@/features/pokemonRules/partyRuleConfig";
import { calculateDefensiveMatchupScore } from "@/features/selections/utils/calculateDefensiveMatchupScore";
import { calculateOffensiveMatchupScore } from "@/features/selections/utils/calculateOffensiveMatchupScore";
import { suggestBasicSelection } from "@/features/selections/utils/suggestBasicSelection";
import { suggestMatchupSelections } from "@/features/selections/utils/suggestMatchupSelections";
import type { Party, PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonAbilityWarning } from "@/types/pokemonAbilityWarning";
import type { PokemonCommonMove } from "@/types/pokemonCommonMove";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
                    <BattlePreviewHeader partyId={party.id} />

                    <OpponentPokemonSearchSection
                        partyRule={party.rule}
                        pokemonList={pokemonList}
                        opponentPokemonList={opponentPokemonList}
                        partyPokemonLimit={ruleConfig.partyPokemonLimit}
                        searchKeyword={searchKeyword}
                        selectedTypes={selectedTypes}
                        onChangeSearchKeyword={setSearchKeyword}
                        onChangeSelectedTypes={setSelectedTypes}
                        onSelectPokemon={handleAddOpponentPokemon}
                    />

                    <MatchupSelectionSuggestionsSection
                        opponentPokemonCount={opponentPokemonList.length}
                        currentPokemonCount={currentPokemonList.length}
                        selectionPokemonLimit={ruleConfig.selectionPokemonLimit}
                        matchupSelectionSuggestions={
                            matchupSelectionSuggestions
                        }
                        pokemonList={pokemonList}
                        onSelectSuggestion={setSelectedPartyPokemonIds}
                    />

                    <StatComparisonModeSection
                        comparisonMode={comparisonMode}
                        onToggleComparisonMode={handleToggleComparisonMode}
                    />

                    <NextBattleActionSuggestions
                        ownPartyPokemon={actionOwnPartyPokemon}
                        ownPokemonMaster={actionOwnPokemonMaster}
                        opponentPokemon={actionOpponentPokemon}
                        partyPokemonList={effectiveCurrentPokemonList}
                        pokemonMasterList={pokemonList}
                        selectedPartyPokemonIds={selectedPartyPokemonIds}
                        pokemonCommonMoves={pokemonCommonMoves}
                    />

                    <BattleLogCreateNavigationSection
                        battleLogCreateHref={battleLogCreateHref}
                        canCreateBattleLog={canCreateBattleLog}
                        opponentPokemonCount={opponentPokemonList.length}
                        selectedPokemonCount={selectedPartyPokemonIds.length}
                        selectionPokemonLimit={ruleConfig.selectionPokemonLimit}
                    />

                    <details className="rounded border bg-white p-3">
                        <summary className="cursor-pointer text-sm font-bold">
                            詳細分析を見る
                        </summary>

                        <div className="mt-6 space-y-8">
                            <OpponentPartyAnalysisSection
                                opponentPokemonCount={
                                    opponentPokemonList.length
                                }
                                opponentAnalysis={opponentAnalysis}
                                opponentWeaknessAnalysis={
                                    opponentWeaknessAnalysis
                                }
                            />

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
