import { AbilityTooltip } from "@/features/battlePreview/components/AbilityTooltip";
import { ItemTooltip } from "@/features/battlePreview/components/ItemTooltip";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type RegisteredPartyPokemonCardProps = {
    partyPokemon: PartyPokemon;
    pokemonMaster?: Pokemon;
    canRemove: boolean;
    isRemoving: boolean;
    onRemove: () => void;
};

export function RegisteredPartyPokemonCard({
    partyPokemon,
    pokemonMaster,
    canRemove,
    isRemoving,
    onRemove,
}: RegisteredPartyPokemonCardProps) {
    const effortValues = [
        {
            label: "H",
            value: partyPokemon.ev_h ?? 0,
        },
        {
            label: "A",
            value: partyPokemon.ev_a ?? 0,
        },
        {
            label: "B",
            value: partyPokemon.ev_b ?? 0,
        },
        {
            label: "C",
            value: partyPokemon.ev_c ?? 0,
        },
        {
            label: "D",
            value: partyPokemon.ev_d ?? 0,
        },
        {
            label: "S",
            value: partyPokemon.ev_s ?? 0,
        },
    ];

    const moves = [
        {
            name: partyPokemon.move_1,
            type: partyPokemon.move_1_type,
        },
        {
            name: partyPokemon.move_2,
            type: partyPokemon.move_2_type,
        },
        {
            name: partyPokemon.move_3,
            type: partyPokemon.move_3_type,
        },
        {
            name: partyPokemon.move_4,
            type: partyPokemon.move_4_type,
        },
    ].filter((move) => move.name);

    return (
        <div className="rounded border bg-white p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    {pokemonMaster?.image_url ? (
                        <img
                            src={pokemonMaster.image_url}
                            alt={pokemonMaster.name}
                            className="h-16 w-16 shrink-0 object-contain"
                        />
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                            ?
                        </div>
                    )}

                    <div className="min-w-0">
                        <p className="truncate font-bold">
                            {partyPokemon.nickname ||
                                pokemonMaster?.name ||
                                partyPokemon.pokemon_key}
                        </p>

                        {pokemonMaster && (
                            <p className="mt-1 text-xs text-gray-600">
                                {pokemonMaster.types.join(" / ")}
                            </p>
                        )}
                    </div>
                </div>

                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={isRemoving}
                        className="shrink-0 rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                        {isRemoving ? "処理中..." : "外す"}
                    </button>
                )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
                {effortValues.map((effortValue) => (
                    <span
                        key={effortValue.label}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                    >
                        {effortValue.label}
                        {effortValue.value}
                    </span>
                ))}
            </div>

            {(partyPokemon.item ||
                partyPokemon.ability ||
                partyPokemon.nature) && (
                <div className="mt-3 space-y-1 text-xs text-gray-700">
                    {partyPokemon.item && (
                        <p className="flex flex-wrap items-center gap-1">
                            <span>持ち物：</span>

                            <ItemTooltip
                                name={partyPokemon.item}
                                description={
                                    partyPokemon.item_master?.description
                                }
                                effectRules={
                                    partyPokemon.item_master?.effect_rules
                                }
                            />
                        </p>
                    )}

                    {partyPokemon.ability && (
                        <p className="flex flex-wrap items-center gap-1">
                            <span>特性：</span>

                            <AbilityTooltip
                                name={partyPokemon.ability}
                                description={
                                    partyPokemon.ability_master?.description
                                }
                            />
                        </p>
                    )}

                    {partyPokemon.nature && (
                        <p>
                            性格：
                            {partyPokemon.nature}
                        </p>
                    )}
                </div>
            )}

            {moves.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700">技</p>

                    <div className="mt-1 grid gap-1 sm:grid-cols-2">
                        {moves.map((move) => (
                            <div
                                key={`${move.name}-${move.type}`}
                                className="flex min-w-0 items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs"
                            >
                                <span className="truncate">{move.name}</span>

                                {move.type && (
                                    <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] text-gray-600">
                                        {move.type}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {partyPokemon.role_tags && partyPokemon.role_tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {partyPokemon.role_tags.map((tag) => (
                        <span
                            key={tag.id}
                            className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-700"
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
