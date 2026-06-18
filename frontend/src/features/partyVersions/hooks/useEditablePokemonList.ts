import { useCallback, useState } from "react";
import type { EditablePokemon } from "@/features/partyVersions/types/editablePokemon";
import { toggleRoleTagId } from "@/features/partyPokemon/utils/toggleRoleTagId";
import type { Pokemon } from "@/types/pokemon";
import { createEditablePokemon } from "../utils/editablePokemon";

export const useEditablePokemonList = (
    initialPokemonList: EditablePokemon[] = [],
) => {
    const [editablePokemonList, setEditablePokemonList] =
        useState<EditablePokemon[]>(initialPokemonList);

    const initializePokemonList = useCallback(
        (pokemonList: EditablePokemon[]) => {
            setEditablePokemonList(pokemonList);
        },
        [],
    );

    const updatePokemon = (
        index: number,
        field: keyof EditablePokemon,
        value: string | number | number[] | null,
    ) => {
        setEditablePokemonList((currentList) =>
            currentList.map((pokemon, currentIndex) =>
                currentIndex === index
                    ? {
                          ...pokemon,
                          [field]: value,
                      }
                    : pokemon,
            ),
        );
    };

    const toggleRoleTag = (index: number, roleTagId: number) => {
        setEditablePokemonList((currentList) =>
            currentList.map((pokemon, currentIndex) => {
                if (currentIndex !== index) {
                    return pokemon;
                }

                return {
                    ...pokemon,
                    role_tag_ids: toggleRoleTagId(
                        pokemon.role_tag_ids,
                        roleTagId,
                    ),
                };
            }),
        );
    };

    const addPokemon = (pokemon: Pokemon) => {
        setEditablePokemonList((currentList) => [
            ...currentList,
            createEditablePokemon(pokemon),
        ]);
    };

    const replacePokemon = (index: number, pokemon: Pokemon) => {
        setEditablePokemonList((currentList) =>
            currentList.map((currentPokemon, currentIndex) =>
                currentIndex === index
                    ? createEditablePokemon(pokemon)
                    : currentPokemon,
            ),
        );
    };

    const removePokemon = (index: number) => {
        setEditablePokemonList((currentList) =>
            currentList.filter((_, currentIndex) => currentIndex !== index),
        );
    };

    return {
        editablePokemonList,
        setEditablePokemonList,
        initializePokemonList,
        updatePokemon,
        toggleRoleTag,
        addPokemon,
        replacePokemon,
        removePokemon,
    };
};
