import type { Party } from "@/types/party";

type CanRemoveInitialPartyPokemonParams = {
    currentVersion: Party["current_version"];
    currentPokemonCount: number;
    partyPokemonLimit: number;
};

export const canRemoveInitialPartyPokemon = ({
    currentVersion,
    currentPokemonCount,
    partyPokemonLimit,
}: CanRemoveInitialPartyPokemonParams): boolean => {
    if (!currentVersion) {
        return false;
    }

    return (
        currentVersion.is_current === true &&
        currentVersion.version_number === 1 &&
        currentPokemonCount < partyPokemonLimit &&
        (currentVersion.selection_templates?.length ?? 0) === 0 &&
        (currentVersion.battle_logs?.length ?? 0) === 0
    );
};
