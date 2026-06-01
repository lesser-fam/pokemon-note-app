import { api } from "@/lib/api";
import type { PartyPokemon } from "@/types/party";

export type StorePartyPokemonPayload = {
    pokemon_key: string;
    form_key: string;
    nickname?: string;
    item?: string;
    ability?: string;
    nature?: string;
    ev_h?: number;
    ev_a?: number;
    ev_b?: number;
    ev_c?: number;
    ev_d?: number;
    ev_s?: number;
    move_1?: string;
    move_1_type?: string;
    move_2?: string;
    move_2_type?: string;
    move_3?: string;
    move_3_type?: string;
    move_4?: string;
    move_4_type?: string;
    memo?: string;
    role_tag_ids?: number[];
};

export const createPartyPokemon = async (
    partyVersionId: number,
    payload: StorePartyPokemonPayload,
): Promise<PartyPokemon> => {
    const response = await api.post<{ data: PartyPokemon }>(
        `/api/party-versions/${partyVersionId}/pokemon`,
        payload,
    );

    return response.data.data;
};

export const deletePartyPokemon = async (
    partyPokemonId: number,
): Promise<void> => {
    await api.delete(`/api/party-pokemon/${partyPokemonId}`);
};
