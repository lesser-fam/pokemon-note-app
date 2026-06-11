import { BattlePokemonCard } from "@/features/battlePreview/components/BattlePokemonCard";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import { AbilityTooltip } from "./AbilityTooltip";
import { ItemTooltip } from "./ItemTooltip";
import type { PokemonStatKey } from "./PokemonStatLabels";
import { MegaFormToggle } from "./MegaFormToggle";

type OwnPartyColumnProps = {
    partyPokemonList: PartyPokemon[];
    pokemonList: Pokemon[];
    selectedPartyPokemonIds: number[];
    highlightedStats?: PokemonStatKey[];
    findPokemonMaster: (
        pokemonKey: string,
        formKey: string,
    ) => Pokemon | undefined;
    onToggleSelection: (partyPokemonId: number) => void;
    onChangeForm: (partyPokemonId: number, pokemon: Pokemon) => void;
};

export function OwnPartyColumn({
    partyPokemonList,
    pokemonList,
    selectedPartyPokemonIds,
    highlightedStats = [],
    findPokemonMaster,
    onToggleSelection,
    onChangeForm,
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
                                headerAction={
                                    <MegaFormToggle
                                        pokemon={pokemonMaster}
                                        pokemonList={pokemonList}
                                        onChange={(pokemon) =>
                                            onChangeForm(
                                                partyPokemon.id,
                                                pokemon,
                                            )
                                        }
                                    />
                                }
                                imageAction={
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onToggleSelection(partyPokemon.id)
                                        }
                                        className={`flex h-4 w-full items-center justify-center whitespace-nowrap rounded border px-0.5 text-[10px] font-semibold leading-none ${
                                            selectionOrder
                                                ? "border-black bg-black text-white"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        {selectionOrder ?? "選出外"}
                                    </button>
                                }
                                footer={
                                    <div className="flex flex-wrap gap-1">
                                        {partyPokemon.ability_master ? (
                                            <AbilityTooltip
                                                name={
                                                    partyPokemon.ability_master
                                                        .name
                                                }
                                                description={
                                                    partyPokemon.ability_master
                                                        .description
                                                }
                                            />
                                        ) : (
                                            <span className="text-[10px] leading-none text-gray-400">
                                                特性未登録
                                            </span>
                                        )}

                                        {partyPokemon.item ? (
                                            <ItemTooltip
                                                name={partyPokemon.item}
                                                description={
                                                    partyPokemon.item_master
                                                        ?.description
                                                }
                                                effectRules={
                                                    partyPokemon.item_master
                                                        ?.effect_rules
                                                }
                                            />
                                        ) : (
                                            <span className="text-[10px] leading-none text-gray-400">
                                                持ち物未登録
                                            </span>
                                        )}
                                    </div>
                                }
                            />
                        );
                    })}
                </div>
            )}
        </aside>
    );
}
