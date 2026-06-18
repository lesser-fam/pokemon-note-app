import type { EditablePokemon } from "@/features/partyVersions/types/editablePokemon";
import { hasDuplicatedValues } from "@/features/partyPokemon/utils/hasDuplicatedValues";
import { validateEffortValues } from "@/features/partyPokemon/utils/validateEffortValues";

type EffortValueLimits = {
    totalLimit: number;
    singleLimit: number;
};

export type EditablePokemonListValidationError =
    | "invalid_effort_values"
    | "duplicated_items"
    | "duplicated_moves";

type EditablePokemonListValidationResult =
    | {
          isValid: true;
      }
    | {
          isValid: false;
          error: EditablePokemonListValidationError;
      };

export const validateEditablePokemonList = (
    pokemonList: EditablePokemon[],
    effortValueLimits: EffortValueLimits,
): EditablePokemonListValidationResult => {
    const hasInvalidEffortValues = pokemonList.some((pokemon) => {
        const effortValues = [
            pokemon.ev_h,
            pokemon.ev_a,
            pokemon.ev_b,
            pokemon.ev_c,
            pokemon.ev_d,
            pokemon.ev_s,
        ];

        return !validateEffortValues(effortValues, effortValueLimits).isValid;
    });

    if (hasInvalidEffortValues) {
        return {
            isValid: false,
            error: "invalid_effort_values",
        };
    }

    const hasDuplicatedItems = hasDuplicatedValues(
        pokemonList.map((pokemon) => pokemon.item),
    );

    if (hasDuplicatedItems) {
        return {
            isValid: false,
            error: "duplicated_items",
        };
    }

    const hasDuplicatedMoves = pokemonList.some((pokemon) =>
        hasDuplicatedValues([
            pokemon.move_1,
            pokemon.move_2,
            pokemon.move_3,
            pokemon.move_4,
        ]),
    );

    if (hasDuplicatedMoves) {
        return {
            isValid: false,
            error: "duplicated_moves",
        };
    }

    return {
        isValid: true,
    };
};
