export type ComparisonMode =
    | "speed"
    | "own_attack_vs_opponent_defense"
    | "own_defense_vs_opponent_attack"
    | "own_special_attack_vs_opponent_special_defense"
    | "own_special_defense_vs_opponent_special_attack"
    | null;

type StatComparisonMode = Exclude<ComparisonMode, null>;

type StatComparisonModeSectionProps = {
    comparisonMode: ComparisonMode;
    onToggleComparisonMode: (mode: StatComparisonMode) => void;
};

const comparisonModes: {
    mode: StatComparisonMode;
    label: string;
}[] = [
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
];

export const StatComparisonModeSection = ({
    comparisonMode,
    onToggleComparisonMode,
}: StatComparisonModeSectionProps) => {
    return (
        <section className="rounded border bg-white p-3">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold">能力値を比較</h2>

                <div className="text-[10px] text-gray-400">
                    H：HP / A：攻撃 / B：防御 / C：特攻 / D：特防 / S：素早さ
                </div>
            </div>

            <div className="mt-2 grid grid-cols-5 gap-1">
                {comparisonModes.map((comparison) => {
                    const isSelected = comparisonMode === comparison.mode;

                    return (
                        <button
                            key={comparison.mode}
                            type="button"
                            onClick={() =>
                                onToggleComparisonMode(comparison.mode)
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
    );
};
