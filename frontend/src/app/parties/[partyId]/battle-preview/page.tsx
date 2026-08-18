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
import { useSelectedOpponentPokemonKeys } from "@/features/battlePreview/hooks/useSelectedOpponentPokemonKeys";
import { useSelectedPartyPokemonIds } from "@/features/battlePreview/hooks/useSelectedPartyPokemonIds";
import { useStatComparisonMode } from "@/features/battlePreview/hooks/useStatComparisonMode";
import { analyzeOpponentParty } from "@/features/battlePreview/utils/analyzeOpponentParty";
import { analyzeOpponentWeakness } from "@/features/battlePreview/utils/analyzeOpponentWeakness";
import { createBattleLogCreateNavigation } from "@/features/battlePreview/utils/createBattleLogCreateNavigation";
import { createEffectivePartyPokemonList } from "@/features/battlePreview/utils/createEffectivePartyPokemonList";
import { getHighlightedStatsByComparisonMode } from "@/features/battlePreview/utils/getHighlightedStatsByComparisonMode";
import { createQuickBattleLog } from "@/features/battleLogs/api/battleLogApi";
import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import { getPartyRuleConfig } from "@/features/pokemonRules/partyRuleConfig";
import { calculateDefensiveMatchupScore } from "@/features/selections/utils/calculateDefensiveMatchupScore";
import { calculateOffensiveMatchupScore } from "@/features/selections/utils/calculateOffensiveMatchupScore";
import { suggestBasicSelection } from "@/features/selections/utils/suggestBasicSelection";
import { suggestMatchupSelections } from "@/features/selections/utils/suggestMatchupSelections";
import type { Pokemon } from "@/types/pokemon";
import { getApiErrorMessage } from "@/utils/apiError";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";

// Add Champions Pokemon
// import { convertChampionsDexNumbersToIdentifiers } from "@/features/pokemonRules/tmp/convertChampionsPokemon";

export default function BattlePreviewPage() {
    const router = useRouter();
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

    const {
        selectedOpponentPokemonKeys,
        handleToggleSelectedOpponentPokemon,
        handleRemoveSelectedOpponentPokemon,
        handleChangeSelectedOpponentPokemonForm,
    } = useSelectedOpponentPokemonKeys(opponentPokemonList);

    const handleRemoveOpponentPokemonWithSelection = (pokemon: Pokemon) => {
        handleRemoveOpponentPokemon(pokemon);
        handleRemoveSelectedOpponentPokemon(pokemon);
    };

    const handleChangeOpponentPokemonFormWithSelection = (
        currentPokemon: Pokemon,
        nextPokemon: Pokemon,
    ) => {
        handleChangeOpponentPokemonForm(currentPokemon, nextPokemon);
        handleChangeSelectedOpponentPokemonForm(
            currentPokemon,
            nextPokemon,
        );
    };

    const { pokemonAbilityGroups, pokemonCommonMoves } =
        useOpponentPokemonBattleData({
            opponentPokemonList,
            partyRule: party?.rule ?? "main_series",
        });

    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);
    const [quickErrorMessage, setQuickErrorMessage] = useState("");
    const isQuickSubmittingRef = useRef(false);

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
        const pokemonAbilityData = pokemonAbilityGroups.find(
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
        pokemonCommonMoves,
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

    const selectedOpponentPokemonList = selectedOpponentPokemonKeys
        .map((selectedKey) =>
            opponentPokemonList.find(
                (pokemon) =>
                    `${pokemon.key}:${pokemon.form_key}` === selectedKey,
            ),
        )
        .filter((pokemon): pokemon is Pokemon => Boolean(pokemon));

    const canCreateQuickBattleLog =
        canCreateBattleLog && selectedOpponentPokemonList.length > 0;

    const handleCreateQuickBattleLog = async (result: "win" | "lose") => {
        if (isQuickSubmittingRef.current) {
            return;
        }

        const partyVersion = party.current_version;
        const firstOpponent = opponentPokemonList[0];
        const firstSelectedOpponent = selectedOpponentPokemonList[0];

        if (
            !partyVersion ||
            !canCreateQuickBattleLog ||
            !firstOpponent ||
            !firstSelectedOpponent
        ) {
            setQuickErrorMessage(
                "相手パーティ、自分の選出3匹、相手の実選出1匹以上を選んでください。",
            );

            return;
        }

        isQuickSubmittingRef.current = true;
        setIsQuickSubmitting(true);
        setQuickErrorMessage("");

        try {
            await createQuickBattleLog(partyVersion.id, {
                result,

                opponent_pokemon_1: firstOpponent.key,
                opponent_form_1: firstOpponent.form_key,
                opponent_pokemon_2: opponentPokemonList[1]?.key ?? null,
                opponent_form_2:
                    opponentPokemonList[1]?.form_key ?? null,
                opponent_pokemon_3: opponentPokemonList[2]?.key ?? null,
                opponent_form_3:
                    opponentPokemonList[2]?.form_key ?? null,
                opponent_pokemon_4: opponentPokemonList[3]?.key ?? null,
                opponent_form_4:
                    opponentPokemonList[3]?.form_key ?? null,
                opponent_pokemon_5: opponentPokemonList[4]?.key ?? null,
                opponent_form_5:
                    opponentPokemonList[4]?.form_key ?? null,
                opponent_pokemon_6: opponentPokemonList[5]?.key ?? null,
                opponent_form_6:
                    opponentPokemonList[5]?.form_key ?? null,

                selected_pokemon_1_id: selectedPartyPokemonIds[0],
                selected_pokemon_2_id: selectedPartyPokemonIds[1],
                selected_pokemon_3_id: selectedPartyPokemonIds[2],

                selected_opponent_pokemon_1: firstSelectedOpponent.key,
                selected_opponent_form_1: firstSelectedOpponent.form_key,
                selected_opponent_pokemon_2:
                    selectedOpponentPokemonList[1]?.key ?? null,
                selected_opponent_form_2:
                    selectedOpponentPokemonList[1]?.form_key ?? null,
                selected_opponent_pokemon_3:
                    selectedOpponentPokemonList[2]?.key ?? null,
                selected_opponent_form_3:
                    selectedOpponentPokemonList[2]?.form_key ?? null,
            });

            router.push(
                `/parties/${party.id}?notice=battle-log-saved`,
            );
        } catch (error) {
            console.error(error);
            setQuickErrorMessage(
                getApiErrorMessage(
                    error,
                    "対戦ログの保存に失敗しました。",
                ),
            );
            isQuickSubmittingRef.current = false;
            setIsQuickSubmitting(false);
        }
    };

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
                        canCreateQuickBattleLog={canCreateQuickBattleLog}
                        opponentPokemonCount={opponentPokemonList.length}
                        selectedPokemonCount={selectedPartyPokemonIds.length}
                        selectedOpponentPokemonCount={
                            selectedOpponentPokemonList.length
                        }
                        selectionPokemonLimit={ruleConfig.selectionPokemonLimit}
                        isQuickSubmitting={isQuickSubmitting}
                        quickErrorMessage={quickErrorMessage}
                        onCreateQuickBattleLog={handleCreateQuickBattleLog}
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
                        onRemove={handleRemoveOpponentPokemonWithSelection}
                        onChangeForm={
                            handleChangeOpponentPokemonFormWithSelection
                        }
                        selectedOpponentPokemonKeys={
                            selectedOpponentPokemonKeys
                        }
                        onToggleOpponentSelection={
                            handleToggleSelectedOpponentPokemon
                        }
                    />
                </div>
            </div>
        </main>
    );
}
