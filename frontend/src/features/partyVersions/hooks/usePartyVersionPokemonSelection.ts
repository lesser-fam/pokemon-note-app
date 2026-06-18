import { useState } from "react";

import { shiftIndexAfterRemoval } from "@/features/partyVersions/utils/shiftIndexAfterRemoval";

export const usePartyVersionPokemonSelection = () => {
    const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<
        number | null
    >(null);

    const [editingPokemonIndex, setEditingPokemonIndex] = useState<
        number | null
    >(null);

    const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(
        null,
    );

    const selectPokemon = (index: number) => {
        setSelectedPokemonIndex(index);

        setEditingPokemonIndex((currentEditingIndex) => {
            if (currentEditingIndex === null) {
                return null;
            }

            return index;
        });
    };

    const startEditingSelectedPokemon = () => {
        if (selectedPokemonIndex === null) {
            return null;
        }

        setEditingPokemonIndex(selectedPokemonIndex);

        return selectedPokemonIndex;
    };

    const startReplacingSelectedPokemon = () => {
        if (selectedPokemonIndex === null) {
            return null;
        }

        setReplaceTargetIndex(selectedPokemonIndex);
        setEditingPokemonIndex(null);

        return selectedPokemonIndex;
    };

    const finishAddingPokemon = (addedIndex: number) => {
        setSelectedPokemonIndex(addedIndex);
        setEditingPokemonIndex(null);
    };

    const finishReplacingPokemon = (replacedIndex: number) => {
        setReplaceTargetIndex(null);
        setSelectedPokemonIndex(replacedIndex);
        setEditingPokemonIndex(null);
    };

    const finishRemovingPokemon = (removedIndex: number) => {
        setSelectedPokemonIndex(null);

        setEditingPokemonIndex((currentIndex) =>
            shiftIndexAfterRemoval(currentIndex, removedIndex),
        );

        setReplaceTargetIndex((currentIndex) =>
            shiftIndexAfterRemoval(currentIndex, removedIndex),
        );
    };

    const cancelReplacingPokemon = () => {
        setReplaceTargetIndex(null);
    };

    const closePokemonEditor = () => {
        setEditingPokemonIndex(null);
    };

    return {
        selectedPokemonIndex,
        editingPokemonIndex,
        replaceTargetIndex,
        selectPokemon,
        startEditingSelectedPokemon,
        startReplacingSelectedPokemon,
        finishAddingPokemon,
        finishReplacingPokemon,
        finishRemovingPokemon,
        cancelReplacingPokemon,
        closePokemonEditor,
    };
};
