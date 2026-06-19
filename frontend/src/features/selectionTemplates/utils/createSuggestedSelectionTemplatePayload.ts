import type { PartyPokemon } from "@/types/party";

type SuggestedSelectionItem = {
    role: string;
    pokemon?: PartyPokemon | null;
};

type SuggestedSelectionTemplatePayload =
    | {
          isValid: true;
          payload: {
              name: string;
              lead_pokemon_id: number;
              switch_pokemon_id: number;
              finisher_pokemon_id: number;
              memo: string;
          };
      }
    | {
          isValid: false;
      };

export const createSuggestedSelectionTemplatePayload = (
    suggestedSelection: SuggestedSelectionItem[],
): SuggestedSelectionTemplatePayload => {
    const lead = suggestedSelection.find(
        (suggestion) => suggestion.role === "lead",
    );

    const switchPokemon = suggestedSelection.find(
        (suggestion) => suggestion.role === "switch",
    );

    const finisher = suggestedSelection.find(
        (suggestion) => suggestion.role === "finisher",
    );

    if (!lead?.pokemon || !switchPokemon?.pokemon || !finisher?.pokemon) {
        return {
            isValid: false,
        };
    }

    return {
        isValid: true,
        payload: {
            name: "おすすめ基本選出",
            lead_pokemon_id: lead.pokemon.id,
            switch_pokemon_id: switchPokemon.pokemon.id,
            finisher_pokemon_id: finisher.pokemon.id,
            memo: "役割タグの点数から自動提案された基本選出です。",
        },
    };
};
