import { api } from "@/lib/api";
import type { PokemonCommonMove } from "@/types/pokemonCommonMove";

type FetchPokemonCommonMovesParams = {
    pokemonKey?: string;
    formKey?: string;
};

type CreatePokemonCommonMoveParams = {
    pokemon_key: string;
    form_key: string;
    move_id: number;
    usage_rank?: number;
    memo?: string | null;
};

export const fetchPokemonCommonMoves = async ({
    pokemonKey,
    formKey,
}: FetchPokemonCommonMovesParams = {}): Promise<PokemonCommonMove[]> => {
    const response = await api.get<{ data: PokemonCommonMove[] }>(
        "/api/pokemon-common-moves",
        {
            params: {
                pokemon_key: pokemonKey,
                form_key: formKey,
            },
        },
    );

    return response.data.data;
};

export const createPokemonCommonMove = async (
    params: CreatePokemonCommonMoveParams,
): Promise<PokemonCommonMove> => {
    const response = await api.post<{ data: PokemonCommonMove }>(
        "/api/pokemon-common-moves",
        params,
    );

    return response.data.data;
};

export const deletePokemonCommonMove = async (id: number): Promise<void> => {
    await api.delete(`/api/pokemon-common-moves/${id}`);
};
