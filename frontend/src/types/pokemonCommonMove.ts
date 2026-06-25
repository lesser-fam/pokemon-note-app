import type { MoveMaster } from "@/types/battleMaster";
import type { PartyRule } from "@/types/party";

export type PokemonCommonMove = {
    id: number;
    rule: PartyRule;
    pokemon_key: string;
    form_key: string;
    move_id: number;
    usage_rank: number;
    memo: string | null;
    move_master: MoveMaster;
    created_at: string;
    updated_at: string;
};
