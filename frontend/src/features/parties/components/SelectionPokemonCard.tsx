import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type SelectionPokemonCardProps = {
    label: string;
    partyPokemon?: PartyPokemon | null;
    pokemonList: Pokemon[];
};

export const SelectionPokemonCard = ({
    label,
    partyPokemon,
    pokemonList,
}: SelectionPokemonCardProps) => {
    const pokemonMaster = partyPokemon
        ? findPokemonMaster({
              pokemonList,
              pokemonKey: partyPokemon.pokemon_key,
              formKey: partyPokemon.form_key,
          })
        : undefined;

    return (
        <div className="rounded border bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-500">{label}</p>

            <div className="mt-2 flex items-center gap-2">
                {pokemonMaster?.image_url ? (
                    <img
                        src={pokemonMaster.image_url}
                        alt={pokemonMaster.name}
                        className="h-10 w-10 shrink-0 object-contain"
                    />
                ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white text-xs text-gray-500">
                        ?
                    </div>
                )}

                <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                        {partyPokemon?.nickname ||
                            pokemonMaster?.name ||
                            partyPokemon?.pokemon_key ||
                            "未設定"}
                    </p>

                    {pokemonMaster && (
                        <p className="mt-0.5 truncate text-[11px] text-gray-600">
                            {pokemonMaster.types.join(" / ")}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
