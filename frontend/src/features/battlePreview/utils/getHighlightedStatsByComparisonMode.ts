import type { ComparisonMode } from "@/features/battlePreview/components/StatComparisonModeSection";

type HighlightedStat = "a" | "b" | "c" | "d" | "s";

type HighlightedStats = {
    ownHighlightedStats: HighlightedStat[];
    opponentHighlightedStats: HighlightedStat[];
};

export const getHighlightedStatsByComparisonMode = (
    comparisonMode: ComparisonMode,
): HighlightedStats => {
    if (comparisonMode === "speed") {
        return {
            ownHighlightedStats: ["s"],
            opponentHighlightedStats: ["s"],
        };
    }

    if (comparisonMode === "own_attack_vs_opponent_defense") {
        return {
            ownHighlightedStats: ["a"],
            opponentHighlightedStats: ["b"],
        };
    }

    if (comparisonMode === "own_defense_vs_opponent_attack") {
        return {
            ownHighlightedStats: ["b"],
            opponentHighlightedStats: ["a"],
        };
    }

    if (comparisonMode === "own_special_attack_vs_opponent_special_defense") {
        return {
            ownHighlightedStats: ["c"],
            opponentHighlightedStats: ["d"],
        };
    }

    if (comparisonMode === "own_special_defense_vs_opponent_special_attack") {
        return {
            ownHighlightedStats: ["d"],
            opponentHighlightedStats: ["c"],
        };
    }

    return {
        ownHighlightedStats: [],
        opponentHighlightedStats: [],
    };
};
