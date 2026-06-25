import { api } from "@/lib/api";
import type { PokemonCommonMove } from "@/types/pokemonCommonMove";
import type { PartyRule } from "@/types/party";

type FetchPokemonCommonMovesParams = {
    rule?: PartyRule;
    pokemonKey?: string;
    formKey?: string;
};

type CreatePokemonCommonMoveParams = {
    rule?: PartyRule;
    pokemon_key: string;
    form_key: string;
    move_id: number;
    usage_rank?: number;
    memo?: string | null;
};

type ImportPokemonCommonMovesResult = {
    imported_count: number;
    updated_count: number;
    error_count: number;
    errors: string[];
};

export const fetchPokemonCommonMoves = async ({
    rule = "main_series",
    pokemonKey,
    formKey,
}: FetchPokemonCommonMovesParams = {}): Promise<PokemonCommonMove[]> => {
    const response = await api.get<{ data: PokemonCommonMove[] }>(
        "/api/pokemon-common-moves",
        {
            params: {
                rule,
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

export const importPokemonCommonMoves = async (
    csvFile: File,
): Promise<ImportPokemonCommonMovesResult> => {
    const formData = new FormData();
    formData.append("csv_file", csvFile);

    const response = await api.post<ImportPokemonCommonMovesResult>(
        "/api/pokemon-common-moves/import",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    );

    return response.data;
};

export const deletePokemonCommonMove = async (id: number): Promise<void> => {
    await api.delete(`/api/pokemon-common-moves/${id}`);
};
