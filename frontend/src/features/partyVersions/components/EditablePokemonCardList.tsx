import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import type { EditablePokemon } from "@/features/partyVersions/types/editablePokemon";
import type { Pokemon } from "@/types/pokemon";

type EditablePokemonCardListProps = {
    editablePokemonList: EditablePokemon[];
    pokemonList: Pokemon[];
    selectedPokemonIndex: number | null;
    onSelectPokemon: (index: number) => void;
};

export const EditablePokemonCardList = ({
    editablePokemonList,
    pokemonList,
    selectedPokemonIndex,
    onSelectPokemon,
}: EditablePokemonCardListProps) => {
    return (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {editablePokemonList.map((pokemon, index) => {
                const pokemonMaster = findPokemonMaster({
                    pokemonList,
                    pokemonKey: pokemon.pokemon_key,
                    formKey: pokemon.form_key,
                });

                const isSelected = selectedPokemonIndex === index;

                return (
                    <button
                        key={`${pokemon.pokemon_key}-${pokemon.form_key}-${index}`}
                        type="button"
                        onClick={() => onSelectPokemon(index)}
                        className={`rounded border p-3 text-left transition ${
                            isSelected
                                ? "border-black bg-gray-100 ring-2 ring-black"
                                : "bg-white hover:bg-gray-50"
                        }`}
                    >
                        <p className="text-xs text-gray-400">
                            {index + 1}匹目
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            {pokemonMaster?.image_url ? (
                                <img
                                    src={pokemonMaster.image_url}
                                    alt={pokemonMaster.name}
                                    className="h-12 w-12 shrink-0 object-contain"
                                />
                            ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-100 text-xs">
                                    ?
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold">
                                    {pokemonMaster?.name ||
                                        pokemon.pokemon_key}
                                </p>

                                {pokemonMaster && (
                                    <p className="mt-0.5 truncate text-[11px] text-gray-600">
                                        {pokemonMaster.types.join(" / ")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};