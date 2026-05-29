import { api } from "@/lib/api";
import type { Party } from "@/types/party";

export type StorePartyPayload = {
    name: string;
    rule?: string;
    concept?: string;
    memo?: string;
};

export const fetchParties = async (): Promise<Party[]> => {
    const response = await api.get<{ data: Party[] }>("/api/parties");

    return response.data.data;
};

export const createParty = async (
    payload: StorePartyPayload,
): Promise<Party> => {
    const response = await api.post<{ data: Party }>("/api/parties", payload);

    return response.data.data;
};

export const fetchParty = async (partyId: number): Promise<Party> => {
    const response = await api.get<{ data: Party }>(`/api/parties/${partyId}`);

    return response.data.data;
};
