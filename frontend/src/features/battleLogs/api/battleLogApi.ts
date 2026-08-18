import { api } from "@/lib/api";
import type { BattleLog } from "@/types/party";

export type StoreBattleLogPayload = {
    result: "win" | "lose";

    opponent_pokemon_1?: string | null;
    opponent_form_1?: string | null;
    opponent_pokemon_2?: string | null;
    opponent_form_2?: string | null;
    opponent_pokemon_3?: string | null;
    opponent_form_3?: string | null;
    opponent_pokemon_4?: string | null;
    opponent_form_4?: string | null;
    opponent_pokemon_5?: string | null;
    opponent_form_5?: string | null;
    opponent_pokemon_6?: string | null;
    opponent_form_6?: string | null;

    selected_pokemon_1_id?: number | null;
    selected_pokemon_2_id?: number | null;
    selected_pokemon_3_id?: number | null;

    selected_opponent_pokemon_1?: string | null;
    selected_opponent_form_1?: string | null;
    selected_opponent_pokemon_2?: string | null;
    selected_opponent_form_2?: string | null;
    selected_opponent_pokemon_3?: string | null;
    selected_opponent_form_3?: string | null;

    heavy_opponent_key?: string | null;
    heavy_opponent_form?: string | null;

    needed_pokemon_id?: number | null;

    loss_tags?: string[];

    reflection?: string | null;
    next_note?: string | null;
};

export type StoreQuickBattleLogPayload = {
    result: "win" | "lose";

    opponent_pokemon_1: string;
    opponent_form_1: string | null;
    opponent_pokemon_2: string | null;
    opponent_form_2: string | null;
    opponent_pokemon_3: string | null;
    opponent_form_3: string | null;
    opponent_pokemon_4: string | null;
    opponent_form_4: string | null;
    opponent_pokemon_5: string | null;
    opponent_form_5: string | null;
    opponent_pokemon_6: string | null;
    opponent_form_6: string | null;

    selected_pokemon_1_id: number;
    selected_pokemon_2_id: number;
    selected_pokemon_3_id: number;

    selected_opponent_pokemon_1: string;
    selected_opponent_form_1: string | null;
    selected_opponent_pokemon_2: string | null;
    selected_opponent_form_2: string | null;
    selected_opponent_pokemon_3: string | null;
    selected_opponent_form_3: string | null;
};

export const createBattleLog = async (
    partyVersionId: number,
    payload: StoreBattleLogPayload,
): Promise<BattleLog> => {
    const response = await api.post<{ data: BattleLog }>(
        `/api/party-versions/${partyVersionId}/battle-logs`,
        payload,
    );

    return response.data.data;
};

export const createQuickBattleLog = async (
    partyVersionId: number,
    payload: StoreQuickBattleLogPayload,
): Promise<BattleLog> => {
    const response = await api.post<{ data: BattleLog }>(
        `/api/party-versions/${partyVersionId}/battle-logs/quick`,
        payload,
    );

    return response.data.data;
};

export const updateBattleLog = async (
    battleLogId: number,
    payload: StoreBattleLogPayload,
): Promise<BattleLog> => {
    const response = await api.put<{ data: BattleLog }>(
        `/api/battle-logs/${battleLogId}`,
        payload,
    );

    return response.data.data;
};

export const deleteBattleLog = async (battleLogId: number): Promise<void> => {
    await api.delete(`/api/battle-logs/${battleLogId}`);
};
