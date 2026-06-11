import type { MatchupEffectRule } from "@/types/battleMaster";

type ItemTooltipProps = {
    name: string;
    description?: string | null;
    effectRules?: MatchupEffectRule[];
};

export function ItemTooltip({
    name,
    description,
    effectRules = [],
}: ItemTooltipProps) {
    const descriptions = [
        ...new Set(
            effectRules
                .map((rule) => rule.description)
                .filter((description): description is string =>
                    Boolean(description),
                ),
        ),
    ];

    const hasDescription = descriptions.length > 0;

    const ariaDescription =
        [description, ...descriptions].filter(Boolean).join(" ") ||
        "説明文は未登録です。";

    return (
        <span
            tabIndex={0}
            className="group relative inline-flex cursor-help rounded bg-violet-50 px-1.5 py-0.5 text-[10px] text-violet-800 outline-none ring-offset-1 focus:ring-1 focus:ring-violet-500"
            aria-label={`${name}：${ariaDescription}`}
        >
            {name}

            <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded bg-gray-900 p-2 text-[11px] leading-relaxed text-white shadow-lg group-hover:block group-focus:block">
                <span className="block font-semibold">{name}</span>

                {description ? (
                    <span className="mt-1 block">{description}</span>
                ) : (
                    <span className="mt-1 block text-gray-300">
                        基本説明は未登録です。
                    </span>
                )}

                {hasDescription && (
                    <span className="mt-2 block border-t border-gray-700 pt-2">
                        <span className="block font-semibold">
                            対戦評価への反映
                        </span>

                        <span className="mt-1 block space-y-1">
                            {descriptions.map((ruleDescription) => (
                                <span key={ruleDescription} className="block">
                                    {ruleDescription}
                                </span>
                            ))}
                        </span>
                    </span>
                )}
            </span>
        </span>
    );
}
