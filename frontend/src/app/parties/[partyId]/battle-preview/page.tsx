"use client";

import { PageStateMessage } from "@/components/pageStates/PageStateMessage";
import { BattleLogCreateNavigationSection } from "@/features/battlePreview/components/BattleLogCreateNavigationSection";
import { BattlePreviewDetailAnalysisSection } from "@/features/battlePreview/components/BattlePreviewDetailAnalysisSection";
import { BattlePreviewHeader } from "@/features/battlePreview/components/BattlePreviewHeader";
import { MatchupSelectionSuggestionsSection } from "@/features/battlePreview/components/MatchupSelectionSuggestionsSection";
import { NextBattleActionSuggestions } from "@/features/battlePreview/components/NextBattleActionSuggestions";
import { OpponentPartyColumn } from "@/features/battlePreview/components/OpponentPartyColumn";
import { OpponentPokemonSearchSection } from "@/features/battlePreview/components/OpponentPokemonSearchSection";
import { OwnPartyColumn } from "@/features/battlePreview/components/OwnPartyColumn";
import {
    StatComparisonModeSection,
    type ComparisonMode,
} from "@/features/battlePreview/components/StatComparisonModeSection";
import { useActionOwnPokemon } from "@/features/battlePreview/hooks/useActionOwnPokemon";
import { useOpponentPokemonList } from "@/features/battlePreview/hooks/useOpponentPokemonList";
import { useSelectedPartyPokemonIds } from "@/features/battlePreview/hooks/useSelectedPartyPokemonIds";
import { analyzeOpponentParty } from "@/features/battlePreview/utils/analyzeOpponentParty";
import { analyzeOpponentWeakness } from "@/features/battlePreview/utils/analyzeOpponentWeakness";
import { createBattleLogCreateNavigation } from "@/features/battlePreview/utils/createBattleLogCreateNavigation";
import { createEffectivePartyPokemonList } from "@/features/battlePreview/utils/createEffectivePartyPokemonList";
import { getHighlightedStatsByComparisonMode } from "@/features/battlePreview/utils/getHighlightedStatsByComparisonMode";
import { isMegaForm } from "@/features/battlePreview/utils/megaEvolution";
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
import type { Party } from "@/types/party";
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

    const ruleConfig = getPartyRuleConfig(party?.rule ?? "main_series");

    const {
        selectedPartyPokemonIds,
        handleTogglePartyPokemonSelection,
        selectPartyPokemonIds,
    } = useSelectedPartyPokemonIds({
        selectionPokemonLimit: ruleConfig.selectionPokemonLimit,
    });

    const { actionOwnPokemonId, handleToggleActionOwnPokemon } =
        useActionOwnPokemon();

    const {
        opponentPokemonList,
        actionOpponentPokemonKey,
        handleAddOpponentPokemon,
        handleRemoveOpponentPokemon,
        handleChangeOpponentPokemonForm,
        handleToggleActionOpponentPokemon,
    } = useOpponentPokemonList({
        pokemonList,
        partyPokemonLimit: ruleConfig.partyPokemonLimit,
    });

    const [pokemonAbilityWarnings, setPokemonAbilityWarnings] = useState<
        PokemonAbilityWarning[]
    >([]);

    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const [ownPokemonFormOverrides, setOwnPokemonFormOverrides] = useState<
        Record<number, string>
    >({});
    const [ownPokemonAbilityOverrides, setOwnPokemonAbilityOverrides] =
        useState<Record<number, PokemonAbilityCandidate | null>>({});
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>(null);

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

    const { ownHighlightedStats, opponentHighlightedStats } =
        getHighlightedStatsByComparisonMode(comparisonMode);

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

    const effectiveCurrentPokemonList = createEffectivePartyPokemonList({
        currentPokemonList,
        formOverrides: ownPokemonFormOverrides,
        abilityOverrides: ownPokemonAbilityOverrides,
    });

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

    const { battleLogCreateHref, canCreateBattleLog } =
        createBattleLogCreateNavigation({
            partyId: party.id,
            opponentPokemonList,
            selectedPartyPokemonIds,
            selectionPokemonLimit: ruleConfig.selectionPokemonLimit,
        });

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
                        onSelectSuggestion={selectPartyPokemonIds}
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

                    <BattlePreviewDetailAnalysisSection
                        opponentPokemonCount={opponentPokemonList.length}
                        currentPokemonCount={currentPokemonList.length}
                        selectionPokemonLimit={ruleConfig.selectionPokemonLimit}
                        opponentAnalysis={opponentAnalysis}
                        opponentWeaknessAnalysis={opponentWeaknessAnalysis}
                        offensiveMatchupResults={offensiveMatchupResults}
                        defensiveMatchupResults={defensiveMatchupResults}
                        savedSelectionTemplates={savedSelectionTemplates}
                        suggestedSelection={suggestedSelection}
                        pokemonList={pokemonList}
                    />
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
