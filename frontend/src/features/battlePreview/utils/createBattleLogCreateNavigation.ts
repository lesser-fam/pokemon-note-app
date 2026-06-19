import type { Pokemon } from "@/types/pokemon";

type CreateBattleLogCreateNavigationParams = {
    partyId: number;
    opponentPokemonList: Pokemon[];
    selectedPartyPokemonIds: number[];
    selectionPokemonLimit: number;
};

type BattleLogCreateNavigation = {
    battleLogCreateHref: string;
    canCreateBattleLog: boolean;
};

export const createBattleLogCreateNavigation = ({
    partyId,
    opponentPokemonList,
    selectedPartyPokemonIds,
    selectionPokemonLimit,
}: CreateBattleLogCreateNavigationParams): BattleLogCreateNavigation => {
    const opponentQuery = opponentPokemonList
        .map((pokemon) => `${pokemon.key}:${pokemon.form_key}`)
        .join(",");

    const selectedQuery = selectedPartyPokemonIds.join(",");

    return {
        battleLogCreateHref:
            `/parties/${partyId}/battle-logs/create` +
            `?opponents=${opponentQuery}` +
            `&selected=${selectedQuery}`,

        canCreateBattleLog:
            opponentPokemonList.length > 0 &&
            selectedPartyPokemonIds.length === selectionPokemonLimit,
    };
};
