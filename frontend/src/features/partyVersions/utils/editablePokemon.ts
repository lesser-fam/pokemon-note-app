import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { EditablePokemon } from "@/features/partyVersions/types/editablePokemon";

export const createEditablePokemon = (pokemon: Pokemon): EditablePokemon => {
    return {
        pokemon_key: pokemon.key,
        form_key: pokemon.form_key,
        nickname: "",

        item: "",
        item_id: null,

        ability: "",
        ability_id: null,

        nature: "",
        nature_id: null,

        ev_h: 0,
        ev_a: 0,
        ev_b: 0,
        ev_c: 0,
        ev_d: 0,
        ev_s: 0,

        move_1: "",
        move_1_id: null,
        move_1_type: "",

        move_2: "",
        move_2_id: null,
        move_2_type: "",

        move_3: "",
        move_3_id: null,
        move_3_type: "",

        move_4: "",
        move_4_id: null,
        move_4_type: "",

        memo: "",
        role_tag_ids: [],
    };
};

export const convertPartyPokemonToEditablePokemon = (
    pokemon: PartyPokemon,
): EditablePokemon => {
    return {
        pokemon_key: pokemon.pokemon_key,
        form_key: pokemon.form_key,
        nickname: pokemon.nickname ?? "",

        item: pokemon.item ?? "",
        item_id: pokemon.item_id ?? null,

        ability: pokemon.ability ?? "",
        ability_id: pokemon.ability_id ?? null,

        nature: pokemon.nature ?? "",
        nature_id: pokemon.nature_id ?? null,

        ev_h: pokemon.ev_h ?? 0,
        ev_a: pokemon.ev_a ?? 0,
        ev_b: pokemon.ev_b ?? 0,
        ev_c: pokemon.ev_c ?? 0,
        ev_d: pokemon.ev_d ?? 0,
        ev_s: pokemon.ev_s ?? 0,

        move_1: pokemon.move_1 ?? "",
        move_1_id: pokemon.move_1_id ?? null,
        move_1_type: pokemon.move_1_type ?? "",

        move_2: pokemon.move_2 ?? "",
        move_2_id: pokemon.move_2_id ?? null,
        move_2_type: pokemon.move_2_type ?? "",

        move_3: pokemon.move_3 ?? "",
        move_3_id: pokemon.move_3_id ?? null,
        move_3_type: pokemon.move_3_type ?? "",

        move_4: pokemon.move_4 ?? "",
        move_4_id: pokemon.move_4_id ?? null,
        move_4_type: pokemon.move_4_type ?? "",

        memo: pokemon.memo ?? "",
        role_tag_ids: pokemon.role_tags?.map((tag) => tag.id) ?? [],
    };
};
