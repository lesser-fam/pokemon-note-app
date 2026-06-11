export type MoveMaster = {
    id: number;
    key: string;
    name: string;
    type: string;
    damage_class: "physical" | "special" | "status";
    power: number | null;
    is_scoring_target: boolean;
};

export type MatchupEffectRule = {
    id: number;
    key: string;
    effect_type: string;
    target_type: string | null;
    value: number | null;
    condition: string | null;
    description: string | null;
};

export type AbilityMaster = {
    id: number;
    key: string;
    name: string;
    description: string | null;
    effect_rules?: MatchupEffectRule[];
};

export type ItemMaster = {
    id: number;
    key: string;
    name: string;
    description: string | null;
    effect_rules?: MatchupEffectRule[];
};

export type NatureMaster = {
    id: number;
    key: string;
    name: string;
    increased_stat: string | null;
    decreased_stat: string | null;
};
