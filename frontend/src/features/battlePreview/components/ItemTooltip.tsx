import type { MatchupEffectRule } from "@/types/battleMaster";

type ItemTooltipProps = {
    name: string;
    effectRules?: MatchupEffectRule[];
};

export function ItemTooltip({ name, effectRules = [] }: ItemTooltipProps) {
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

    const ariaDescription = hasDescription
        ? descriptions.join(" ")
        : "説明文は未登録です。";

    return (
        <span
            tabIndex={0}
            className="group relative inline-flex cursor-help rounded bg-violet-50 px-1.5 py-0.5 text-[10px] text-violet-800 outline-none ring-offset-1 focus:ring-1 focus:ring-violet-500"
            aria-label={`${name}：${ariaDescription}`}
        >
            {name}

            <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded bg-gray-900 p-2 text-[11px] leading-relaxed text-white shadow-lg group-hover:block group-focus:block">
                <span className="block font-semibold">{name}</span>

                {hasDescription ? (
                    <span className="mt-1 block space-y-1">
                        {descriptions.map((description) => (
                            <span key={description} className="block">
                                {description}
                            </span>
                        ))}
                    </span>
                ) : (
                    <span className="mt-1 block">説明文は未登録です。</span>
                )}
            </span>
        </span>
    );
}
