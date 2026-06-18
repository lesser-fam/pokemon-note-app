export type EditablePokemon = {
    pokemon_key: string;
    form_key: string;
    nickname: string;

    item: string;
    item_id: number | null;

    ability: string;
    ability_id: number | null;

    nature: string;
    nature_id: number | null;

    ev_h: number;
    ev_a: number;
    ev_b: number;
    ev_c: number;
    ev_d: number;
    ev_s: number;

    move_1: string;
    move_1_id: number | null;
    move_1_type: string;

    move_2: string;
    move_2_id: number | null;
    move_2_type: string;

    move_3: string;
    move_3_id: number | null;
    move_3_type: string;

    move_4: string;
    move_4_id: number | null;
    move_4_type: string;

    memo: string;
    role_tag_ids: number[];
};
