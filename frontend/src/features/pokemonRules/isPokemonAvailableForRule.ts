import type { Pokemon } from "@/types/pokemon";
import { championsAllowedPokemonKeys } from "./championsAllowedPokemon";

export const isPokemonAvailableForRule = (
    pokemon: Pokemon,
    rule?: string | null,
): boolean => {
    if (rule === "champions") {
        return championsAllowedPokemonKeys.includes(pokemon.key);
    }

    return true;
};
