import type { NatureMaster } from "@/types/battleMaster";

export type EffortValueStatKey = "h" | "a" | "b" | "c" | "d" | "s";

type EffortValueValues = Record<EffortValueStatKey, string | number>;

type EffortValueLimits = {
    totalLimit: number;
    singleLimit: number;
    label: string;
};

type EffortValueEditorProps = {
    values: EffortValueValues;
    limits: EffortValueLimits;
    nature?: NatureMaster | null;
    onChange: (statKey: EffortValueStatKey, value: string) => void;
};

type NatureAdjustment = "up" | "down" | null;

const statDefinitions: {
    statKey: EffortValueStatKey;
    label: string;
}[] = [
    {
        statKey: "h",
        label: "H",
    },
    {
        statKey: "a",
        label: "A",
    },
    {
        statKey: "b",
        label: "B",
    },
    {
        statKey: "c",
        label: "C",
    },
    {
        statKey: "d",
        label: "D",
    },
    {
        statKey: "s",
        label: "S",
    },
];

const toNumber = (value: string | number): number => {
    return Number(value || 0);
};

export function EffortValueEditor({
    values,
    limits,
    nature = null,
    onChange,
}: EffortValueEditorProps) {
    const total = statDefinitions.reduce(
        (currentTotal, { statKey }) => currentTotal + toNumber(values[statKey]),
        0,
    );

    const getNatureAdjustment = (
        statKey: EffortValueStatKey,
    ): NatureAdjustment => {
        if (nature?.increased_stat === statKey) {
            return "up";
        }

        if (nature?.decreased_stat === statKey) {
            return "down";
        }

        return null;
    };

    const getNatureAdjustmentLabel = (adjustment: NatureAdjustment): string => {
        if (adjustment === "up") {
            return "↑";
        }

        if (adjustment === "down") {
            return "↓";
        }

        return "";
    };

    const getNatureAdjustmentClassName = (
        adjustment: NatureAdjustment,
    ): string => {
        if (adjustment === "up") {
            return "text-red-600";
        }

        if (adjustment === "down") {
            return "text-blue-600";
        }

        return "text-gray-700";
    };

    const hasOverTotalLimit = total > limits.totalLimit;

    return (
        <div>
            <p className="text-sm font-medium">努力値</p>

            <p
                className={`mt-1 text-[10px] ${
                    hasOverTotalLimit ? "text-red-600" : "text-gray-500"
                }`}
            >
                {limits.label}：合計 {total} / {limits.totalLimit}
            </p>

            <p className="mt-1 text-[10px] text-gray-500">
                1項目 {limits.singleLimit}まで
            </p>

            <p className="mt-1 text-[10px] text-gray-500">
                赤↑：上昇 / 青↓：下降
            </p>

            {hasOverTotalLimit && (
                <p className="mt-1 text-[10px] text-red-600">
                    合計努力値が上限を超えています。
                </p>
            )}

            <div className="mt-3 space-y-2">
                {statDefinitions.map(({ statKey, label }) => {
                    const adjustment = getNatureAdjustment(statKey);

                    return (
                        <div key={statKey} className="flex items-center gap-2">
                            <label
                                className={`w-6 text-xs font-bold ${getNatureAdjustmentClassName(
                                    adjustment,
                                )}`}
                            >
                                {label}
                                {getNatureAdjustmentLabel(adjustment)}
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                className="w-16 rounded border px-2 py-1.5 text-right text-sm"
                                value={values[statKey]}
                                onFocus={(event) => event.target.select()}
                                onChange={(event) => {
                                    const nextValue = event.target.value;

                                    if (!/^\d*$/.test(nextValue)) {
                                        return;
                                    }

                                    if (
                                        toNumber(nextValue) > limits.singleLimit
                                    ) {
                                        return;
                                    }

                                    onChange(statKey, nextValue);
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
