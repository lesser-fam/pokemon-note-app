import { useState } from "react";

type UseSelectedPartyPokemonIdsParams = {
    selectionPokemonLimit: number;
};

export const useSelectedPartyPokemonIds = ({
    selectionPokemonLimit,
}: UseSelectedPartyPokemonIdsParams) => {
    const [selectedPartyPokemonIds, setSelectedPartyPokemonIds] = useState<
        number[]
    >([]);

    const handleTogglePartyPokemonSelection = (partyPokemonId: number) => {
        setSelectedPartyPokemonIds((currentIds) => {
            if (currentIds.includes(partyPokemonId)) {
                return currentIds.filter((id) => id !== partyPokemonId);
            }

            if (currentIds.length >= selectionPokemonLimit) {
                return currentIds;
            }

            return [...currentIds, partyPokemonId];
        });
    };

    const selectPartyPokemonIds = (partyPokemonIds: number[]) => {
        setSelectedPartyPokemonIds(
            partyPokemonIds.slice(0, selectionPokemonLimit),
        );
    };

    return {
        selectedPartyPokemonIds,
        handleTogglePartyPokemonSelection,
        selectPartyPokemonIds,
    };
};
