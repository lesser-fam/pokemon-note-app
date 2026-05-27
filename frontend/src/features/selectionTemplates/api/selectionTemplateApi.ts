import { api } from "@/lib/api";
import type { SelectionTemplate } from "@/types/party";

export type StoreSelectionTemplatePayload = {
    name: string;
    lead_pokemon_id: number;
    switch_pokemon_id: number;
    finisher_pokemon_id: number;
    memo?: string;
};

export const createSelectionTemplate = async (
    partyVersionId: number,
    payload: StoreSelectionTemplatePayload,
): Promise<SelectionTemplate> => {
    const response = await api.post<{ data: SelectionTemplate }>(
        `/api/party-versions/${partyVersionId}/selection-templates`,
        payload,
    );

    return response.data.data;
};
