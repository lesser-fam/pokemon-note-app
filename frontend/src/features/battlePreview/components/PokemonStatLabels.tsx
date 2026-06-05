import type { Pokemon } from "@/types/pokemon";

export type PokemonStatKey = "h" | "a" | "b" | "c" | "d" | "s";

type PokemonStatLabelsProps = {
    stats: Pokemon["base_stats"];
    highlightedStats?: PokemonStatKey[];
};

const statLabels: {
    key: PokemonStatKey;
    label: string;
}[] = [
    { key: "h", label: "H" },
    { key: "a", label: "A" },
    { key: "b", label: "B" },
    { key: "c", label: "C" },
    { key: "d", label: "D" },
    { key: "s", label: "S" },
];

export function PokemonStatLabels({
    stats,
    highlightedStats = [],
}: PokemonStatLabelsProps) {
    return (
        <div className="flex flex-wrap gap-1">
            {statLabels.map((stat) => {
                const isHighlighted = highlightedStats.includes(stat.key);

                return (
                    <span
                        key={stat.key}
                        className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                            isHighlighted
                                ? "bg-yellow-200 text-yellow-900 ring-1 ring-yellow-500"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {stat.label}
                        {stats[stat.key]}
                    </span>
                );
            })}
        </div>
    );
}
