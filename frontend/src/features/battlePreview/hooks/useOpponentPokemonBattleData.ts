import { fetchPokemonAbilityWarnings } from "@/features/master/api/pokemonAbilityWarningApi";
import { fetchPokemonCommonMoves } from "@/features/pokemonCommonMoves/api/pokemonCommonMoveApi";
import type { PartyRule } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonAbilityWarning } from "@/types/pokemonAbilityWarning";
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
    const [pokemonAbilityWarnings, setPokemonAbilityWarnings] = useState<
        PokemonAbilityWarning[]
    >([]);

    const [pokemonCommonMoves, setPokemonCommonMoves] = useState<
        PokemonCommonMove[]
    >([]);

    useEffect(() => {
        const loadPokemonAbilityWarnings = async () => {
            if (opponentPokemonList.length === 0) {
                setPokemonAbilityWarnings([]);
                return;
            }

            try {
                const pokemonKeys = opponentPokemonList.map(
                    (pokemon) => `${pokemon.key}:${pokemon.form_key}`,
                );

                const data = await fetchPokemonAbilityWarnings(pokemonKeys);

                setPokemonAbilityWarnings(data);
            } catch (error) {
                console.error(error);
                setPokemonAbilityWarnings([]);
            }
        };

        loadPokemonAbilityWarnings();
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
        pokemonAbilityWarnings,
        pokemonCommonMoves,
    };
};
