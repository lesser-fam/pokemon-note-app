import type { PartyRule } from "./party";

export type OpponentPartyTemplatePokemon = {
    id: number;
    pokemon_key: string;
    form_key: string;
    display_order: number;
};

export type OpponentPartyTemplate = {
    id: number;
    rule: PartyRule;
    memo: string | null;
    pokemon: OpponentPartyTemplatePokemon[];
    created_at: string;
    updated_at: string;
};
