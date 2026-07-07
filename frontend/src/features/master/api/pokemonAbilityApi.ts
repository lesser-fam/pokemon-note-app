import { api } from "@/lib/api";
import type { PokemonAbilityGroup } from "@/types/pokemonAbility";

export const fetchPokemonAbilitiesByPokemon = async (
    pokemonKeys: string[],
): Promise<PokemonAbilityGroup[]> => {
    if (pokemonKeys.length === 0) {
        return [];
    }

    const response = await api.get<{ data: PokemonAbilityGroup[] }>(
        "/api/pokemon-abilities",
        {
            params: {
                pokemon: pokemonKeys,
            },
        },
    );

    return response.data.data;
};
