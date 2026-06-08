import { PokemonStatLabels } from "@/features/battlePreview/components/PokemonStatLabels";
import type { PokemonStatKey } from "@/features/battlePreview/components/PokemonStatLabels";
import type { Pokemon } from "@/types/pokemon";
import type { ReactNode } from "react";

type BattlePokemonCardProps = {
    pokemon: Pokemon;
    imageAction?: ReactNode;
    headerAction?: ReactNode;
    footer?: ReactNode;
    highlightedStats?: PokemonStatKey[];
};

export function BattlePokemonCard({
    pokemon,
    imageAction,
    headerAction,
    footer,
    highlightedStats = [],
}: BattlePokemonCardProps) {
    return (
        <div className="rounded border bg-white p-2">
            <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-1.5">
                <div className="flex h-17 flex-col justify-between">
                    {pokemon.image_url ? (
                        <img
                            src={pokemon.image_url}
                            alt={pokemon.name}
                            className="mx-auto h-11 w-11 object-contain"
                        />
                    ) : (
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded bg-gray-100 text-xs text-gray-500">
                            ?
                        </div>
                    )}

                    {imageAction && <div className="mt-0.5">{imageAction}</div>}
                </div>

                <div className="min-w-0">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                                {pokemon.name}
                            </p>
                        </div>

                        {headerAction && (
                            <div className="shrink-0">{headerAction}</div>
                        )}
                    </div>

                    <p className="mt-0.5 truncate text-[11px] text-gray-600">
                        {pokemon.types.join(" / ")}
                    </p>

                    <div className="mt-1">
                        <PokemonStatLabels
                            stats={pokemon.base_stats}
                            highlightedStats={highlightedStats}
                        />
                    </div>

                    {footer && (
                        <div className="mt-0.5 flex min-h-4 items-center">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
