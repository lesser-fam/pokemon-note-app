import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type MatchupSuggestionPokemonCardProps = {
    label: string;
    partyPokemon: PartyPokemon;
    pokemonList: Pokemon[];
};

export const MatchupSuggestionPokemonCard = ({
    label,
    partyPokemon,
    pokemonList,
}: MatchupSuggestionPokemonCardProps) => {
    const pokemonMaster = findPokemonMaster({
        pokemonList,
        pokemonKey: partyPokemon.pokemon_key,
        formKey: partyPokemon.form_key,
    });

    const displayName =
        partyPokemon.nickname ||
        pokemonMaster?.name ||
        partyPokemon.pokemon_key;

    return (
        <div className="rounded bg-white px-2 py-1.5">
            <p className="text-[10px] font-semibold text-gray-500">{label}</p>

            <div className="mt-1 flex min-w-0 items-center gap-1.5">
                {pokemonMaster?.image_url ? (
                    <img
                        src={pokemonMaster.image_url}
                        alt={pokemonMaster.name}
                        className="h-8 w-8 shrink-0 object-contain"
                    />
                ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400">
                        ?
                    </div>
                )}

                <p className="min-w-0 truncate text-xs font-bold">
                    {displayName}
                </p>
            </div>
        </div>
    );
};
