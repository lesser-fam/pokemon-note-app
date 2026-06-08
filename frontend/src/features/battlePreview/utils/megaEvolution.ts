import type { Pokemon } from "@/types/pokemon";

export const isMegaForm = (pokemon: Pokemon): boolean => {
    return pokemon.form_key === "mega" || pokemon.form_key.startsWith("mega-");
};

export const findDefaultForm = (
    pokemonList: Pokemon[],
    pokemonKey: string,
): Pokemon | undefined => {
    return pokemonList.find(
        (pokemon) =>
            pokemon.key === pokemonKey && pokemon.form_key === "default",
    );
};

export const findMegaForms = (
    pokemonList: Pokemon[],
    pokemonKey: string,
): Pokemon[] => {
    return pokemonList.filter(
        (pokemon) => pokemon.key === pokemonKey && isMegaForm(pokemon),
    );
};

export const hasMegaForm = (
    pokemonList: Pokemon[],
    pokemonKey: string,
): boolean => {
    return findMegaForms(pokemonList, pokemonKey).length > 0;
};
