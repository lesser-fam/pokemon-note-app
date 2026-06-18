import type { PartyRule } from "@/types/party";

export type PartyRuleConfig = {
    label: string;
    effortValueTotalLimit: number;
    effortValueSingleLimit: number;
    partyPokemonLimit: number;
    selectionPokemonLimit: number;
};

export const partyRuleConfig: Record<PartyRule, PartyRuleConfig> = {
    main_series: {
        label: "本編ルール",
        effortValueTotalLimit: 510,
        effortValueSingleLimit: 252,
        partyPokemonLimit: 6,
        selectionPokemonLimit: 3,
    },

    champions: {
        label: "チャンピオンズ",
        effortValueTotalLimit: 66,
        effortValueSingleLimit: 32,
        partyPokemonLimit: 6,
        selectionPokemonLimit: 3,
    },
};

export const getPartyRuleConfig = (rule: PartyRule): PartyRuleConfig => {
    return partyRuleConfig[rule];
};

export const getEffortValueLimits = (rule: PartyRule) => {
    const config = getPartyRuleConfig(rule);

    return {
        totalLimit: config.effortValueTotalLimit,
        singleLimit: config.effortValueSingleLimit,
        label: config.label,
    };
};
