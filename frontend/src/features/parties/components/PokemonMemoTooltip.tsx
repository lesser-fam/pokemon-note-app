type PokemonMemoTooltipProps = {
    memo: string;
};

export function PokemonMemoTooltip({ memo }: PokemonMemoTooltipProps) {
    return (
        <span
            tabIndex={0}
            className="group relative inline-flex cursor-help rounded bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-800 outline-none ring-offset-1 focus:ring-1 focus:ring-sky-500"
            aria-label={`メモ：${memo}`}
        >
            メモ
            <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 whitespace-pre-wrap rounded bg-gray-900 p-2 text-[11px] leading-relaxed text-white shadow-lg group-hover:block group-focus:block">
                <span className="block font-semibold">メモ</span>

                <span className="mt-1 block">{memo}</span>
            </span>
        </span>
    );
}
