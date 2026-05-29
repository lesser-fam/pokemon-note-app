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
    move_2?: string;
    move_3?: string;
    move_4?: string;
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
