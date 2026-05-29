import { api } from "@/lib/api";
import type { SelectionTemplate } from "@/types/party";

export type StoreSelectionTemplatePayload = {
    name: string;
    lead_pokemon_id: number;
    switch_pokemon_id: number;
    finisher_pokemon_id: number;
    memo?: string;
};

export type UpdateSelectionTemplatePayload = {
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

export const updateSelectionTemplate = async (
    selectionTemplateId: number,
    payload: UpdateSelectionTemplatePayload,
): Promise<SelectionTemplate> => {
    const response = await api.put<{ data: SelectionTemplate }>(
        `/api/selection-templates/${selectionTemplateId}`,
        payload,
    );

    return response.data.data;
};

export const deleteSelectionTemplate = async (
    selectionTemplateId: number,
): Promise<void> => {
    await api.delete(`/api/selection-templates/${selectionTemplateId}`);
};
