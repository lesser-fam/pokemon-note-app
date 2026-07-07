import type { PartyPokemon } from "@/types/party";
import type { PokemonAbilityGroup } from "@/types/pokemonAbility";

type PokemonAbilityCandidate = PokemonAbilityGroup["abilities"][number];

type CreateEffectivePartyPokemonListParams = {
    currentPokemonList: PartyPokemon[];
    formOverrides: Record<number, string>;
    abilityOverrides: Record<number, PokemonAbilityCandidate | null>;
};

export const createEffectivePartyPokemonList = ({
    currentPokemonList,
    formOverrides,
    abilityOverrides,
}: CreateEffectivePartyPokemonListParams): PartyPokemon[] => {
    return currentPokemonList.map((partyPokemon) => {
        const overriddenFormKey = formOverrides[partyPokemon.id];

        const hasAbilityOverride = Object.prototype.hasOwnProperty.call(
            abilityOverrides,
            partyPokemon.id,
        );

        const overriddenAbility = abilityOverrides[partyPokemon.id];

        return {
            ...partyPokemon,

            form_key: overriddenFormKey ?? partyPokemon.form_key,

            ability: hasAbilityOverride
                ? (overriddenAbility?.name ?? "")
                : partyPokemon.ability,

            ability_id: hasAbilityOverride
                ? (overriddenAbility?.id ?? null)
                : partyPokemon.ability_id,

            ability_master: hasAbilityOverride
                ? overriddenAbility
                : partyPokemon.ability_master,
        };
    });
};
