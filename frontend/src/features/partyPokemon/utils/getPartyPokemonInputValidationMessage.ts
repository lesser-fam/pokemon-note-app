import type { PartyPokemonInputValidationError } from "@/features/partyPokemon/utils/validatePartyPokemonInput";

type EffortValueLimits = {
    totalLimit: number;
    singleLimit: number;
    label: string;
};

export const getPartyPokemonInputValidationMessage = (
    error: PartyPokemonInputValidationError,
    effortValueLimits: EffortValueLimits,
): string => {
    if (error === "unselected_master_data") {
        return "特性、性格、技は検索候補から選択してください。";
    }

    if (error === "duplicated_pokemon") {
        return "同じ種類のポケモンは、フォーム違いを含めて同じパーティに登録できません。";
    }

    if (error === "invalid_effort_values") {
        return `${effortValueLimits.label}では、努力値は1項目${effortValueLimits.singleLimit}まで、合計${effortValueLimits.totalLimit}までです。`;
    }

    if (error === "duplicated_item") {
        return "同じ持ち物は同じパーティに登録できません。";
    }

    return "同じポケモンに同じ技を複数登録することはできません。";
};
