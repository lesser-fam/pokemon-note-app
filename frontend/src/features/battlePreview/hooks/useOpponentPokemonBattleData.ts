import { fetchPokemonAbilitiesByPokemon } from "@/features/master/api/pokemonAbilityApi";
import { fetchPokemonCommonMoves } from "@/features/pokemonCommonMoves/api/pokemonCommonMoveApi";
import type { PartyRule } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonAbilityGroup } from "@/types/pokemonAbility";
import type { PokemonCommonMove } from "@/types/pokemonCommonMove";
import { useEffect, useState } from "react";

type UseOpponentPokemonBattleDataParams = {
    opponentPokemonList: Pokemon[];
    partyRule: PartyRule;
};

export const useOpponentPokemonBattleData = ({
    opponentPokemonList,
    partyRule,
}: UseOpponentPokemonBattleDataParams) => {
    const [pokemonAbilityGroups, setPokemonAbilityGroups] = useState<
        PokemonAbilityGroup[]
    >([]);

    const [pokemonCommonMoves, setPokemonCommonMoves] = useState<
        PokemonCommonMove[]
    >([]);

    useEffect(() => {
        const loadPokemonAbilityGroups = async () => {
            if (opponentPokemonList.length === 0) {
                setPokemonAbilityGroups([]);
                return;
            }

            try {
                const pokemonKeys = opponentPokemonList.map(
                    (pokemon) => `${pokemon.key}:${pokemon.form_key}`,
                );

                const data = await fetchPokemonAbilitiesByPokemon(pokemonKeys);

                setPokemonAbilityGroups(data);
            } catch (error) {
                console.error(error);
                setPokemonAbilityGroups([]);
            }
        };

        loadPokemonAbilityGroups();
    }, [opponentPokemonList]);

    useEffect(() => {
        const loadPokemonCommonMoves = async () => {
            if (opponentPokemonList.length === 0) {
                setPokemonCommonMoves([]);
                return;
            }

            try {
                const commonMovesList = await Promise.all(
                    opponentPokemonList.map((pokemon) =>
                        fetchPokemonCommonMoves({
                            rule: partyRule,
                            pokemonKey: pokemon.key,
                            formKey: pokemon.form_key,
                        }),
                    ),
                );

                setPokemonCommonMoves(commonMovesList.flat());
            } catch (error) {
                console.error(error);
                setPokemonCommonMoves([]);
            }
        };

        loadPokemonCommonMoves();
    }, [opponentPokemonList, partyRule]);

    return {
        pokemonAbilityGroups,
        pokemonCommonMoves,
    };
};
