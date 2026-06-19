import { hasDuplicatedValues } from "@/features/partyPokemon/utils/hasDuplicatedValues";
import { validateEffortValues } from "@/features/partyPokemon/utils/validateEffortValues";
import type { EditablePokemon } from "@/features/partyVersions/types/editablePokemon";

type EffortValueLimits = {
    totalLimit: number;
    singleLimit: number;
};

export type EditablePokemonListValidationError =
    | "unselected_master_data"
    | "duplicated_pokemon"
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
    const hasUnselectedMasterData = pokemonList.some((pokemon) => {
        if (pokemon.ability.trim() !== "" && pokemon.ability_id === null) {
            return true;
        }

        if (pokemon.nature.trim() !== "" && pokemon.nature_id === null) {
            return true;
        }

        const moves = [
            { name: pokemon.move_1, id: pokemon.move_1_id },
            { name: pokemon.move_2, id: pokemon.move_2_id },
            { name: pokemon.move_3, id: pokemon.move_3_id },
            { name: pokemon.move_4, id: pokemon.move_4_id },
        ];

        return moves.some(
            (move) => move.name.trim() !== "" && move.id === null,
        );
    });

    if (hasUnselectedMasterData) {
        return {
            isValid: false,
            error: "unselected_master_data",
        };
    }

    const pokemonKeys = pokemonList.map((pokemon) => pokemon.pokemon_key);

    const hasDuplicatedPokemon =
        new Set(pokemonKeys).size !== pokemonKeys.length;

    if (hasDuplicatedPokemon) {
        return {
            isValid: false,
            error: "duplicated_pokemon",
        };
    }

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
