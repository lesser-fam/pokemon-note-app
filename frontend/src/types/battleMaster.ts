export type MoveMaster = {
    id: number;
    key: string;
    name: string;
    type: string;
    damage_class: "physical" | "special" | "status";
    power: number | null;
    is_scoring_target: boolean;
};

export type AbilityMaster = {
    id: number;
    key: string;
    name: string;
};

export type ItemMaster = {
    id: number;
    key: string;
    name: string;
};

export type NatureMaster = {
    id: number;
    key: string;
    name: string;
    increased_stat: string | null;
    decreased_stat: string | null;
};
