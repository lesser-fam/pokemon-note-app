"use client";

import { PageStateMessage } from "@/components/pageStates/PageStateMessage";
import { BattleLogCreateNavigationSection } from "@/features/battlePreview/components/BattleLogCreateNavigationSection";
import { BattlePreviewDetailAnalysisSection } from "@/features/battlePreview/components/BattlePreviewDetailAnalysisSection";
import { BattlePreviewHeader } from "@/features/battlePreview/components/BattlePreviewHeader";
import { BattlePreviewRecommendationNotice } from "@/features/battlePreview/components/BattlePreviewRecommendationNotice";
import { MatchupSelectionSuggestionsSection } from "@/features/battlePreview/components/MatchupSelectionSuggestionsSection";
import { OpponentPartyColumn } from "@/features/battlePreview/components/OpponentPartyColumn";
import { OpponentPokemonSearchSection } from "@/features/battlePreview/components/OpponentPokemonSearchSection";
import { OwnPartyColumn } from "@/features/battlePreview/components/OwnPartyColumn";
import { StatComparisonModeSection } from "@/features/battlePreview/components/StatComparisonModeSection";
import { useBattlePreviewData } from "@/features/battlePreview/hooks/useBattlePreviewData";
import { useOpponentPokemonBattleData } from "@/features/battlePreview/hooks/useOpponentPokemonBattleData";
import { useOpponentPokemonList } from "@/features/battlePreview/hooks/useOpponentPokemonList";
import { useOwnPokemonOverrides } from "@/features/battlePreview/hooks/useOwnPokemonOverrides";
import { useSelectedPartyPokemonIds } from "@/features/battlePreview/hooks/useSelectedPartyPokemonIds";
import { useStatComparisonMode } from "@/features/battlePreview/hooks/useStatComparisonMode";
import { analyzeOpponentParty } from "@/features/battlePreview/utils/analyzeOpponentParty";
import { analyzeOpponentWeakness } from "@/features/battlePreview/utils/analyzeOpponentWeakness";
import { createBattleLogCreateNavigation } from "@/features/battlePreview/utils/createBattleLogCreateNavigation";
import { createEffectivePartyPokemonList } from "@/features/battlePreview/utils/createEffectivePartyPokemonList";
import { getHighlightedStatsByComparisonMode } from "@/features/battlePreview/utils/getHighlightedStatsByComparisonMode";
import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import { getPartyRuleConfig } from "@/features/pokemonRules/partyRuleConfig";
import { calculateDefensiveMatchupScore } from "@/features/selections/utils/calculateDefensiveMatchupScore";
import { calculateOffensiveMatchupScore } from "@/features/selections/utils/calculateOffensiveMatchupScore";
import { suggestBasicSelection } from "@/features/selections/utils/suggestBasicSelection";
import { suggestMatchupSelections } from "@/features/selections/utils/suggestMatchupSelections";
import type { Pokemon } from "@/types/pokemon";
import { useParams } from "next/navigation";
import { useState } from "react";

// Add Champions Pokemon
// import { convertChampionsDexNumbersToIdentifiers } from "@/features/pokemonRules/tmp/convertChampionsPokemon";

export default function BattlePreviewPage() {
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const { party, pokemonList, isLoading, errorMessage } =
        useBattlePreviewData({
            partyId,
            isInvalidPartyId,
        });

    const ruleConfig = getPartyRuleConfig(party?.rule ?? "main_series");

    const {
        selectedPartyPokemonIds,
        handleTogglePartyPokemonSelection,
        selectPartyPokemonIds,
    } = useSelectedPartyPokemonIds({
        selectionPokemonLimit: ruleConfig.selectionPokemonLimit,
    });

    const { comparisonMode, handleToggleComparisonMode } =
        useStatComparisonMode();

    const {
        opponentPokemonList,
        handleAddOpponentPokemon,
        handleRemoveOpponentPokemon,
        handleChangeOpponentPokemonForm,
    } = useOpponentPokemonList({
        pokemonList,
        partyPokemonLimit: ruleConfig.partyPokemonLimit,
    });

    const { pokemonAbilityWarnings } = useOpponentPokemonBattleData({
        opponentPokemonList,
    });

    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    // Add Champions Pokemon
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

    const {
        ownPokemonFormOverrides,
        ownPokemonAbilityOverrides,
        handleChangeOwnPokemonForm,
    } = useOwnPokemonOverrides({
        currentPokemonList,
    });

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
                    />
                </div>

                <div className="min-w-0 space-y-3 xl:max-h-[calc(100vh-1rem)] xl:overflow-y-auto xl:pr-1">
                    <BattlePreviewHeader partyId={party.id} />

                    <BattlePreviewRecommendationNotice
                        opponentPokemonCount={opponentPokemonList.length}
                    />

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
                    />
                </div>
            </div>
        </main>
    );
}
