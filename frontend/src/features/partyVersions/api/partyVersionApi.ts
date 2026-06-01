import { api } from "@/lib/api";
import type { PartyVersion } from "@/types/party";

export type StoreNewPartyVersionPokemonPayload = {
    pokemon_key: string;
    form_key: string;
    nickname?: string | null;
    item?: string | null;
    ability?: string | null;
    nature?: string | null;
    ev_h?: number;
    ev_a?: number;
    ev_b?: number;
    ev_c?: number;
    ev_d?: number;
    ev_s?: number;
    move_1?: string | null;
    move_1_type?: string | null;
    move_2?: string | null;
    move_2_type?: string | null;
    move_3?: string | null;
    move_3_type?: string | null;
    move_4?: string | null;
    move_4_type?: string | null;
    memo?: string | null;
    role_tag_ids?: number[];
};

export type StoreNewPartyVersionPayload = {
    change_note?: string | null;
    pokemon: StoreNewPartyVersionPokemonPayload[];
};

export const createNewPartyVersion = async (
    partyVersionId: number,
    payload: StoreNewPartyVersionPayload,
): Promise<PartyVersion> => {
    const response = await api.post<{ data: PartyVersion }>(
        `/api/party-versions/${partyVersionId}/new-version`,
        payload,
    );

    return response.data.data;
};
