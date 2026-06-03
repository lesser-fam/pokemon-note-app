import { api } from "@/lib/api";
import type { PartyPokemon } from "@/types/party";

export type StorePartyPokemonPayload = {
    pokemon_key: string;
    form_key: string;
    nickname?: string | null;

    item?: string | null;
    item_id?: number | null;

    ability?: string | null;
    ability_id?: number | null;

    nature?: string | null;
    nature_id?: number | null;

    ev_h?: number;
    ev_a?: number;
    ev_b?: number;
    ev_c?: number;
    ev_d?: number;
    ev_s?: number;

    move_1?: string | null;
    move_1_id?: number | null;
    move_1_type?: string | null;

    move_2?: string | null;
    move_2_id?: number | null;
    move_2_type?: string | null;

    move_3?: string | null;
    move_3_id?: number | null;
    move_3_type?: string | null;

    move_4?: string | null;
    move_4_id?: number | null;
    move_4_type?: string | null;

    memo?: string | null;
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
