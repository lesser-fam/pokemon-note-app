import type { Pokemon } from "@/types/pokemon";
import { useState } from "react";

type SelectedOpponentPokemon = Pick<Pokemon, "key" | "form_key">;

const createPokemonIdentity = (pokemon: Pokemon): string => {
    return `${pokemon.key}:${pokemon.form_key}`;
};

export const useSelectedOpponentPokemonKeys = (
    opponentPokemonList: Pokemon[],
) => {
    const [selectedPokemonList, setSelectedPokemonList] = useState<
        SelectedOpponentPokemon[]
    >([]);

    const currentSelectedPokemonList = selectedPokemonList
        .map((selectedPokemon) =>
            opponentPokemonList.find(
                (pokemon) => pokemon.key === selectedPokemon.key,
            ),
        )
        .filter((pokemon): pokemon is Pokemon => Boolean(pokemon));

    const selectedOpponentPokemonKeys = currentSelectedPokemonList.map(
        createPokemonIdentity,
    );

    const handleToggleSelectedOpponentPokemon = (pokemon: Pokemon) => {
        setSelectedPokemonList((currentList) => {
            const availableCurrentList = currentList
                .map((selectedPokemon) =>
                    opponentPokemonList.find(
                        (opponentPokemon) =>
                            opponentPokemon.key === selectedPokemon.key,
                    ),
                )
                .filter(
                    (selectedPokemon): selectedPokemon is Pokemon =>
                        Boolean(selectedPokemon),
                );

            if (
                availableCurrentList.some(
                    (selectedPokemon) =>
                        selectedPokemon.key === pokemon.key,
                )
            ) {
                return availableCurrentList.filter(
                    (selectedPokemon) =>
                        selectedPokemon.key !== pokemon.key,
                );
            }

            if (availableCurrentList.length >= 3) {
                return availableCurrentList;
            }

            return [
                ...availableCurrentList,
                {
                    key: pokemon.key,
                    form_key: pokemon.form_key,
                },
            ];
        });
    };

    const handleRemoveSelectedOpponentPokemon = (pokemon: Pokemon) => {
        setSelectedPokemonList((currentList) =>
            currentList.filter(
                (selectedPokemon) => selectedPokemon.key !== pokemon.key,
            ),
        );
    };

    const handleChangeSelectedOpponentPokemonForm = (
        currentPokemon: Pokemon,
        nextPokemon: Pokemon,
    ) => {
        setSelectedPokemonList((currentList) =>
            currentList.map((selectedPokemon) =>
                selectedPokemon.key === currentPokemon.key
                    ? {
                          key: nextPokemon.key,
                          form_key: nextPokemon.form_key,
                      }
                    : selectedPokemon,
            ),
        );
    };

    return {
        selectedOpponentPokemonKeys,
        handleToggleSelectedOpponentPokemon,
        handleRemoveSelectedOpponentPokemon,
        handleChangeSelectedOpponentPokemonForm,
    };
};
