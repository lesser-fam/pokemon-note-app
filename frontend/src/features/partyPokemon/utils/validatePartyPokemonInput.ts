import { hasDuplicatedValues } from "@/features/partyPokemon/utils/hasDuplicatedValues";
import { validateEffortValues } from "@/features/partyPokemon/utils/validateEffortValues";

type EffortValueLimits = {
    totalLimit: number;
    singleLimit: number;
};

type ValidatePartyPokemonInputParams = {
    pokemonKey: string;
    existingPokemonKeys: string[];

    ability: string;
    abilityId: number | null;

    nature: string;
    natureId: number | null;

    moveEntries: Array<{
        name: string;
        id: number | null;
    }>;

    effortValues: number[];
    moves: Array<string | null | undefined>;
    item: string;
    existingItems: Array<string | null | undefined>;
    effortValueLimits: EffortValueLimits;
};

export type PartyPokemonInputValidationError =
    | "unselected_master_data"
    | "duplicated_pokemon"
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
    pokemonKey,
    existingPokemonKeys,

    ability,
    abilityId,

    nature,
    natureId,

    moveEntries,

    effortValues,
    moves,
    item,
    existingItems,
    effortValueLimits,
}: ValidatePartyPokemonInputParams): PartyPokemonInputValidationResult => {
    const hasUnselectedMasterData =
        (ability.trim() !== "" && abilityId === null) ||
        (nature.trim() !== "" && natureId === null) ||
        moveEntries.some((move) => move.name.trim() !== "" && move.id === null);

    if (hasUnselectedMasterData) {
        return {
            isValid: false,
            error: "unselected_master_data",
        };
    }

    if (existingPokemonKeys.includes(pokemonKey)) {
        return {
            isValid: false,
            error: "duplicated_pokemon",
        };
    }

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
