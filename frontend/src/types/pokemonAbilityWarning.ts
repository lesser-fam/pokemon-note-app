import type { MatchupEffectRule } from "./battleMaster";

export type PokemonAbilityWarningAbility = {
    id: number;
    key: string;
    name: string;
    description: string | null;
    is_hidden: boolean;
    effect_rules: MatchupEffectRule[];
};

export type PokemonAbilityWarning = {
    pokemon_key: string;
    form_key: string;
    abilities: PokemonAbilityWarningAbility[];
};
