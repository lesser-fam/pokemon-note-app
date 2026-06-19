import { useState } from "react";

export const useActionOwnPokemon = () => {
    const [actionOwnPokemonId, setActionOwnPokemonId] = useState<number | null>(
        null,
    );

    const handleToggleActionOwnPokemon = (partyPokemonId: number) => {
        setActionOwnPokemonId((currentId) =>
            currentId === partyPokemonId ? null : partyPokemonId,
        );
    };

    return {
        actionOwnPokemonId,
        handleToggleActionOwnPokemon,
    };
};
