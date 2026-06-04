import { api } from "@/lib/api";
import type { PokemonAbilityWarning } from "@/types/pokemonAbilityWarning";

export const fetchPokemonAbilityWarnings = async (
    pokemonKeys: string[],
): Promise<PokemonAbilityWarning[]> => {
    if (pokemonKeys.length === 0) {
        return [];
    }

    const response = await api.get<{ data: PokemonAbilityWarning[] }>(
        "/api/pokemon-ability-warnings",
        {
            params: {
                pokemon: pokemonKeys,
            },
        },
    );

    return response.data.data;
};
