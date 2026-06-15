import type { Pokemon } from "@/types/pokemon";
import { championsSearchablePokemonIdentifiers } from "./championsAllowedPokemon";

const getPokemonIdentifier = (pokemon: Pokemon): string => {
    return `${pokemon.key}:${pokemon.form_key}`;
};

export const isPokemonAvailableForRule = (
    pokemon: Pokemon,
    rule?: string | null,
): boolean => {
    if (rule === "champions") {
        return championsSearchablePokemonIdentifiers.includes(
            getPokemonIdentifier(pokemon),
        );
    }

    return true;
};
