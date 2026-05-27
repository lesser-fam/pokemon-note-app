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
    move_1: string | null;
    move_2: string | null;
    move_3: string | null;
    move_4: string | null;
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

export type Party = {
    id: number;
    user_id: number;
    name: string;
    concept: string | null;
    memo: string | null;
    created_at: string;
    updated_at: string;
    current_version?: PartyVersion | null;
    versions?: PartyVersion[];
};
