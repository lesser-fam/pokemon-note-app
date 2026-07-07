import type { MatchupEffectRule } from "./battleMaster";

export type PokemonAbilityOption = {
    id: number;
    key: string;
    name: string;
    description: string | null;
    is_hidden: boolean;
    effect_rules: MatchupEffectRule[];
};

export type PokemonAbilityGroup = {
    pokemon_key: string;
    form_key: string;
    abilities: PokemonAbilityOption[];
};
