import { api } from "@/lib/api";
import type { BattleLog } from "@/types/party";

export type StoreBattleLogPayload = {
    result: "win" | "lose";

    opponent_pokemon_1?: string;
    opponent_form_1?: string;
    opponent_pokemon_2?: string;
    opponent_form_2?: string;
    opponent_pokemon_3?: string;
    opponent_form_3?: string;
    opponent_pokemon_4?: string;
    opponent_form_4?: string;
    opponent_pokemon_5?: string;
    opponent_form_5?: string;
    opponent_pokemon_6?: string;
    opponent_form_6?: string;

    selected_pokemon_1_id?: number;
    selected_pokemon_2_id?: number;
    selected_pokemon_3_id?: number;

    selected_opponent_pokemon_1?: string;
    selected_opponent_form_1?: string;
    selected_opponent_pokemon_2?: string;
    selected_opponent_form_2?: string;
    selected_opponent_pokemon_3?: string;
    selected_opponent_form_3?: string;

    heavy_opponent_key?: string;
    heavy_opponent_form?: string;

    needed_pokemon_id?: number;

    loss_tags?: string[];

    reflection?: string;
    next_note?: string;
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

export const deleteBattleLog = async (battleLogId: number): Promise<void> => {
    await api.delete(`/api/battle-logs/${battleLogId}`);
};
