import type { ComparisonMode } from "@/features/battlePreview/components/StatComparisonModeSection";
import { useState } from "react";

type StatComparisonMode = Exclude<ComparisonMode, null>;

export const useStatComparisonMode = () => {
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>(null);

    const handleToggleComparisonMode = (nextMode: StatComparisonMode) => {
        setComparisonMode((currentMode) =>
            currentMode === nextMode ? null : nextMode,
        );
    };

    return {
        comparisonMode,
        handleToggleComparisonMode,
    };
};
