import { DefensiveMatchupSection } from "@/features/battlePreview/components/DefensiveMatchupSection";
import { OffensiveMatchupSection } from "@/features/battlePreview/components/OffensiveMatchupSection";
import { OpponentPartyAnalysisSection } from "@/features/battlePreview/components/OpponentPartyAnalysisSection";
import { OwnSelectionCandidatesSection } from "@/features/battlePreview/components/OwnSelectionCandidatesSection";
import type { Party, PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type SelectionTemplate = NonNullable<
    NonNullable<Party["current_version"]>["selection_templates"]
>[number];

type SuggestedSelectionItem = {
    role: string;
    label: string;
    pokemon?: PartyPokemon | null;
    reason: string;
    score: number;
};

type BattlePreviewDetailAnalysisSectionProps = {
    opponentPokemonCount: number;
    currentPokemonCount: number;
    selectionPokemonLimit: number;
    opponentAnalysis: Parameters<
        typeof OpponentPartyAnalysisSection
    >[0]["opponentAnalysis"];
    opponentWeaknessAnalysis: Parameters<
        typeof OpponentPartyAnalysisSection
    >[0]["opponentWeaknessAnalysis"];
    offensiveMatchupResults: Parameters<
        typeof OffensiveMatchupSection
    >[0]["offensiveMatchupResults"];
    defensiveMatchupResults: Parameters<
        typeof DefensiveMatchupSection
    >[0]["defensiveMatchupResults"];
    savedSelectionTemplates: SelectionTemplate[];
    suggestedSelection: SuggestedSelectionItem[];
    pokemonList: Pokemon[];
};

export const BattlePreviewDetailAnalysisSection = ({
    opponentPokemonCount,
    currentPokemonCount,
    selectionPokemonLimit,
    opponentAnalysis,
    opponentWeaknessAnalysis,
    offensiveMatchupResults,
    defensiveMatchupResults,
    savedSelectionTemplates,
    suggestedSelection,
    pokemonList,
}: BattlePreviewDetailAnalysisSectionProps) => {
    return (
        <details className="rounded border bg-white p-3">
            <summary className="cursor-pointer text-sm font-bold">
                詳細分析を見る
            </summary>

            <div className="mt-6 space-y-8">
                <OpponentPartyAnalysisSection
                    opponentPokemonCount={opponentPokemonCount}
                    opponentAnalysis={opponentAnalysis}
                    opponentWeaknessAnalysis={opponentWeaknessAnalysis}
                />

                <OffensiveMatchupSection
                    opponentPokemonCount={opponentPokemonCount}
                    currentPokemonCount={currentPokemonCount}
                    offensiveMatchupResults={offensiveMatchupResults}
                    pokemonList={pokemonList}
                />

                <DefensiveMatchupSection
                    opponentPokemonCount={opponentPokemonCount}
                    currentPokemonCount={currentPokemonCount}
                    defensiveMatchupResults={defensiveMatchupResults}
                    pokemonList={pokemonList}
                />

                <OwnSelectionCandidatesSection
                    savedSelectionTemplates={savedSelectionTemplates}
                    suggestedSelection={suggestedSelection}
                    currentPokemonCount={currentPokemonCount}
                    selectionPokemonLimit={selectionPokemonLimit}
                    pokemonList={pokemonList}
                />
            </div>
        </details>
    );
};
