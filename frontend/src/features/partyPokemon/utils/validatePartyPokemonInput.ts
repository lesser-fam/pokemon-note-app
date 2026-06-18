import { hasDuplicatedValues } from "@/features/partyPokemon/utils/hasDuplicatedValues";
import { validateEffortValues } from "@/features/partyPokemon/utils/validateEffortValues";

type EffortValueLimits = {
    totalLimit: number;
    singleLimit: number;
};

type ValidatePartyPokemonInputParams = {
    effortValues: number[];
    moves: Array<string | null | undefined>;
    item: string;
    existingItems: Array<string | null | undefined>;
    effortValueLimits: EffortValueLimits;
};

export type PartyPokemonInputValidationError =
    | "invalid_effort_values"
    | "duplicated_item"
    | "duplicated_moves";

type PartyPokemonInputValidationResult =
    | {
          isValid: true;
      }
    | {
          isValid: false;
          error: PartyPokemonInputValidationError;
      };

export const validatePartyPokemonInput = ({
    effortValues,
    moves,
    item,
    existingItems,
    effortValueLimits,
}: ValidatePartyPokemonInputParams): PartyPokemonInputValidationResult => {
    const effortValueValidation = validateEffortValues(
        effortValues,
        effortValueLimits,
    );

    if (!effortValueValidation.isValid) {
        return {
            isValid: false,
            error: "invalid_effort_values",
        };
    }

    const hasDuplicatedItem = hasDuplicatedValues([...existingItems, item]);

    if (hasDuplicatedItem) {
        return {
            isValid: false,
            error: "duplicated_item",
        };
    }

    if (hasDuplicatedValues(moves)) {
        return {
            isValid: false,
            error: "duplicated_moves",
        };
    }

    return {
        isValid: true,
    };
};
