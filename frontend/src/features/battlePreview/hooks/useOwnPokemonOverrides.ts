import { fetchPokemonAbilityWarnings } from "@/features/master/api/pokemonAbilityWarningApi";
import { isMegaForm } from "@/features/battlePreview/utils/megaEvolution";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonAbilityWarning } from "@/types/pokemonAbilityWarning";
import { useState } from "react";

type PokemonAbilityCandidate = PokemonAbilityWarning["abilities"][number];

type UseOwnPokemonOverridesParams = {
    currentPokemonList: PartyPokemon[];
};

export const useOwnPokemonOverrides = ({
    currentPokemonList,
}: UseOwnPokemonOverridesParams) => {
    const [ownPokemonFormOverrides, setOwnPokemonFormOverrides] = useState<
        Record<number, string>
    >({});

    const [ownPokemonAbilityOverrides, setOwnPokemonAbilityOverrides] =
        useState<Record<number, PokemonAbilityCandidate | null>>({});

    const handleChangeOwnPokemonForm = async (
        partyPokemonId: number,
        nextPokemon: Pokemon,
    ) => {
        const originalPartyPokemon = currentPokemonList.find(
            (partyPokemon) => partyPokemon.id === partyPokemonId,
        );

        if (!originalPartyPokemon) {
            return;
        }

        const isNextMegaForm = isMegaForm(nextPokemon);

        setOwnPokemonFormOverrides((currentOverrides) => {
            const nextOverrides = {
                ...currentOverrides,
            };

            if (isNextMegaForm) {
                currentPokemonList.forEach((partyPokemon) => {
                    if (partyPokemon.id === partyPokemonId) {
                        return;
                    }

                    delete nextOverrides[partyPokemon.id];
                });
            }

            if (nextPokemon.form_key === originalPartyPokemon.form_key) {
                delete nextOverrides[partyPokemonId];

                return nextOverrides;
            }

            nextOverrides[partyPokemonId] = nextPokemon.form_key;

            return nextOverrides;
        });

        if (isNextMegaForm) {
            setOwnPokemonAbilityOverrides((currentOverrides) => {
                const nextOverrides = {
                    ...currentOverrides,
                };

                currentPokemonList.forEach((partyPokemon) => {
                    if (partyPokemon.id === partyPokemonId) {
                        return;
                    }

                    delete nextOverrides[partyPokemon.id];
                });

                return nextOverrides;
            });
        }

        if (nextPokemon.form_key === originalPartyPokemon.form_key) {
            setOwnPokemonAbilityOverrides((currentOverrides) => {
                const nextOverrides = {
                    ...currentOverrides,
                };

                delete nextOverrides[partyPokemonId];

                return nextOverrides;
            });

            return;
        }

        try {
            const data = await fetchPokemonAbilityWarnings([
                `${nextPokemon.key}:${nextPokemon.form_key}`,
            ]);

            const abilityCandidates = data[0]?.abilities ?? [];

            const temporaryAbility =
                abilityCandidates.length === 1 ? abilityCandidates[0] : null;

            setOwnPokemonAbilityOverrides((currentOverrides) => ({
                ...currentOverrides,
                [partyPokemonId]: temporaryAbility,
            }));
        } catch (error) {
            console.error(error);

            setOwnPokemonAbilityOverrides((currentOverrides) => ({
                ...currentOverrides,
                [partyPokemonId]: null,
            }));
        }
    };

    return {
        ownPokemonFormOverrides,
        ownPokemonAbilityOverrides,
        handleChangeOwnPokemonForm,
    };
};
