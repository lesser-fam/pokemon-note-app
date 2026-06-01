export type PartyVersion = {
    id: number;
    party_id: number;
    version_number: number;
    change_note: string | null;
    is_current: boolean;
    created_at: string;
    updated_at: string;
    pokemon?: PartyPokemon[];
    selection_templates?: SelectionTemplate[];
    battle_logs?: BattleLog[];
};

export type PartyPokemon = {
    id: number;
    party_version_id: number;
    pokemon_key: string;
    form_key: string;
    nickname: string | null;
    item: string | null;
    ability: string | null;
    nature: string | null;
    ev_h: number;
    ev_a: number;
    ev_b: number;
    ev_c: number;
    ev_d: number;
    ev_s: number;
    move_1: string | null;
    move_1_type: string | null;
    move_2: string | null;
    move_2_type: string | null;
    move_3: string | null;
    move_3_type: string | null;
    move_4: string | null;
    move_4_type: string | null;
    memo: string | null;
    created_at: string;
    updated_at: string;
    role_tags?: {
        id: number;
        key: string;
        name: string;
        description: string;
        examples: string[] | null;
        lead_score: number;
        switch_score: number;
        finisher_score: number;
    }[];
};

export type SelectionTemplate = {
    id: number;
    party_version_id: number;
    name: string;
    lead_pokemon_id: number;
    switch_pokemon_id: number;
    finisher_pokemon_id: number;
    memo: string | null;
    created_at: string;
    updated_at: string;
    lead_pokemon?: PartyPokemon;
    switch_pokemon?: PartyPokemon;
    finisher_pokemon?: PartyPokemon;
};

export type BattleLog = {
    id: number;
    party_version_id: number;
    result: "win" | "lose";

    opponent_pokemon_1: string | null;
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

    selected_pokemon_1_id: number | null;
    selected_pokemon_2_id: number | null;
    selected_pokemon_3_id: number | null;

    heavy_opponent_key: string | null;
    heavy_opponent_form: string | null;

    needed_pokemon_id: number | null;

    loss_tags: string[] | null;

    reflection: string | null;
    next_note: string | null;

    created_at: string;
    updated_at: string;

    selected_pokemon1?: PartyPokemon | null;
    selected_pokemon2?: PartyPokemon | null;
    selected_pokemon3?: PartyPokemon | null;
    needed_pokemon?: PartyPokemon | null;
};

export type Party = {
    id: number;
    user_id: number;
    name: string;
    rule: string | null;
    concept: string | null;
    memo: string | null;
    created_at: string;
    updated_at: string;
    current_version?: PartyVersion | null;
    versions?: PartyVersion[];
};
