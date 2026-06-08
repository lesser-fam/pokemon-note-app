import { BattlePokemonCard } from "@/features/battlePreview/components/BattlePokemonCard";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonStatKey } from "./PokemonStatLabels";

type OwnPartyColumnProps = {
    partyPokemonList: PartyPokemon[];
    selectedPartyPokemonIds: number[];
    highlightedStats?: PokemonStatKey[];
    findPokemonMaster: (
        pokemonKey: string,
        formKey: string,
    ) => Pokemon | undefined;
    onToggleSelection: (partyPokemonId: number) => void;
};

export function OwnPartyColumn({
    partyPokemonList,
    selectedPartyPokemonIds,
    highlightedStats = [],
    findPokemonMaster,
    onToggleSelection,
}: OwnPartyColumnProps) {
    return (
        <aside className="rounded border bg-white p-3">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">自パーティ</h2>

                <p className="text-sm font-medium text-gray-600">
                    {selectedPartyPokemonIds.length} / 3
                </p>
            </div>

            {partyPokemonList.length === 0 ? (
                <p className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
                    ポケモンが登録されていません。
                </p>
            ) : (
                <div className="mt-2 space-y-1.5">
                    {partyPokemonList.map((partyPokemon) => {
                        const pokemonMaster = findPokemonMaster(
                            partyPokemon.pokemon_key,
                            partyPokemon.form_key,
                        );

                        if (!pokemonMaster) {
                            return (
                                <div
                                    key={partyPokemon.id}
                                    className="rounded border bg-red-50 p-3 text-sm text-red-700"
                                >
                                    マスターデータが見つかりません：
                                    {partyPokemon.pokemon_key}
                                </div>
                            );
                        }

                        const selectedIndex = selectedPartyPokemonIds.indexOf(
                            partyPokemon.id,
                        );

                        const selectionOrder =
                            selectedIndex >= 0 ? selectedIndex + 1 : null;

                        return (
                            <BattlePokemonCard
                                key={partyPokemon.id}
                                pokemon={pokemonMaster}
                                highlightedStats={highlightedStats}
                                imageAction={
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onToggleSelection(partyPokemon.id)
                                        }
                                        className={`w-full rounded border px-2 py-1 text-xs font-semibold ${
                                            selectionOrder
                                                ? "border-black bg-black text-white"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        {selectionOrder ?? "選出外"}
                                    </button>
                                }
                                footer={
                                    partyPokemon.ability_master ? (
                                        <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                            {partyPokemon.ability_master.name}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">
                                            特性未登録
                                        </span>
                                    )
                                }
                            />
                        );
                    })}
                </div>
            )}
        </aside>
    );
}
