import type { Pokemon } from "@/types/pokemon";

type FindPokemonMasterParams = {
    pokemonList: Pokemon[];
    pokemonKey: string;
    formKey?: string | null;
    fallbackToDefault?: boolean;
};

export const findPokemonMaster = ({
    pokemonList,
    pokemonKey,
    formKey = "default",
    fallbackToDefault = true,
}: FindPokemonMasterParams): Pokemon | undefined => {
    const normalizedFormKey = formKey || "default";

    const exactPokemon = pokemonList.find(
        (pokemon) =>
            pokemon.key === pokemonKey &&
            pokemon.form_key === normalizedFormKey,
    );

    if (exactPokemon || !fallbackToDefault) {
        return exactPokemon;
    }

    return pokemonList.find(
        (pokemon) =>
            pokemon.key === pokemonKey && pokemon.form_key === "default",
    );
};
