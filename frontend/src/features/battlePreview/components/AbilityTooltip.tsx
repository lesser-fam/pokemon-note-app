type AbilityTooltipProps = {
    name: string;
    description?: string | null;
    isHidden?: boolean;
};

export function AbilityTooltip({
    name,
    description,
    isHidden = false,
}: AbilityTooltipProps) {
    return (
        <span
            tabIndex={0}
            className="group relative inline-flex cursor-help rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-800 outline-none ring-offset-1 focus:ring-1 focus:ring-amber-500"
            aria-label={`${name}：${description || "説明文は未登録です。"}`}
        >
            {name}
            {isHidden && "※"}

            <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-56 -translate-x-1/2 rounded bg-gray-900 p-2 text-[11px] leading-relaxed text-white shadow-lg group-hover:block group-focus:block">
                <span className="block font-semibold">
                    {name}
                    {isHidden && "（隠れ特性）"}
                </span>

                <span className="mt-1 block">
                    {description || "説明文は未登録です。"}
                </span>
            </span>
        </span>
    );
}
