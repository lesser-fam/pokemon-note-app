import {
    findDefaultForm,
    isMegaForm,
} from "@/features/battlePreview/utils/megaEvolution";
import type { Pokemon } from "@/types/pokemon";
import { useState } from "react";

type UseOpponentPokemonListParams = {
    pokemonList: Pokemon[];
    partyPokemonLimit: number;
};

export const useOpponentPokemonList = ({
    pokemonList,
    partyPokemonLimit,
}: UseOpponentPokemonListParams) => {
    const [opponentPokemonList, setOpponentPokemonList] = useState<Pokemon[]>(
        [],
    );

    const [actionOpponentPokemonKey, setActionOpponentPokemonKey] = useState<
        string | null
    >(null);

    const resetOtherOpponentMegaForms = (
        currentList: Pokemon[],
        excludedPokemonKey?: string,
    ): Pokemon[] => {
        return currentList.map((pokemon) => {
            if (pokemon.key === excludedPokemonKey) {
                return pokemon;
            }

            if (!isMegaForm(pokemon)) {
                return pokemon;
            }

            return findDefaultForm(pokemonList, pokemon.key) ?? pokemon;
        });
    };

    const handleAddOpponentPokemon = (pokemon: Pokemon) => {
        if (opponentPokemonList.length >= partyPokemonLimit) {
            return;
        }

        const alreadySelected = opponentPokemonList.some(
            (selectedPokemon) => selectedPokemon.key === pokemon.key,
        );

        if (alreadySelected) {
            return;
        }

        setOpponentPokemonList((currentList) => {
            const nextList = isMegaForm(pokemon)
                ? resetOtherOpponentMegaForms(currentList)
                : currentList;

            return [...nextList, pokemon];
        });
    };

    const handleRemoveOpponentPokemon = (pokemon: Pokemon) => {
        setOpponentPokemonList((currentList) =>
            currentList.filter(
                (selectedPokemon) =>
                    !(
                        selectedPokemon.key === pokemon.key &&
                        selectedPokemon.form_key === pokemon.form_key
                    ),
            ),
        );

        setActionOpponentPokemonKey((currentKey) => {
            if (currentKey === pokemon.key) {
                return null;
            }

            return currentKey;
        });
    };

    const handleChangeOpponentPokemonForm = (
        currentPokemon: Pokemon,
        nextPokemon: Pokemon,
    ) => {
        setOpponentPokemonList((currentList) => {
            const baseList = isMegaForm(nextPokemon)
                ? resetOtherOpponentMegaForms(currentList, currentPokemon.key)
                : currentList;

            return baseList.map((pokemon) =>
                pokemon.key === currentPokemon.key ? nextPokemon : pokemon,
            );
        });
    };

    const handleToggleActionOpponentPokemon = (pokemon: Pokemon) => {
        setActionOpponentPokemonKey((currentKey) =>
            currentKey === pokemon.key ? null : pokemon.key,
        );
    };

    return {
        opponentPokemonList,
        actionOpponentPokemonKey,
        handleAddOpponentPokemon,
        handleRemoveOpponentPokemon,
        handleChangeOpponentPokemonForm,
        handleToggleActionOpponentPokemon,
    };
};
