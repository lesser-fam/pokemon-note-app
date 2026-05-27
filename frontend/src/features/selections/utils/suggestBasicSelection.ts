import type { PartyPokemon } from "@/types/party";

type SelectionRole = "lead" | "switch" | "finisher";

export type SuggestedPokemon = {
    role: SelectionRole;
    label: string;
    pokemon: PartyPokemon | null;
    score: number;
    reason: string;
};

const calculateScore = (
    pokemon: PartyPokemon,
    scoreKey: "lead_score" | "switch_score" | "finisher_score",
): number => {
    return (
        pokemon.role_tags?.reduce((total, tag) => {
            return total + tag[scoreKey];
        }, 0) ?? 0
    );
};

const buildReason = (
    pokemon: PartyPokemon | null,
    scoreKey: "lead_score" | "switch_score" | "finisher_score",
): string => {
    if (!pokemon || !pokemon.role_tags || pokemon.role_tags.length === 0) {
        return "役割タグが未設定です。";
    }

    const effectiveTags = pokemon.role_tags.filter((tag) => tag[scoreKey] > 0);

    if (effectiveTags.length === 0) {
        return "この役割に直接関係するタグは少なめです。";
    }

    return `${effectiveTags.map((tag) => tag.name).join("・")}タグがあるため。`;
};

const pickBestPokemon = (
    pokemonList: PartyPokemon[],
    usedPokemonIds: number[],
    scoreKey: "lead_score" | "switch_score" | "finisher_score",
): { pokemon: PartyPokemon | null; score: number } => {
    const candidates = pokemonList
        .filter((pokemon) => !usedPokemonIds.includes(pokemon.id))
        .map((pokemon) => ({
            pokemon,
            score: calculateScore(pokemon, scoreKey),
        }))
        .sort((a, b) => b.score - a.score);

    return candidates[0] ?? { pokemon: null, score: 0 };
};

export const suggestBasicSelection = (
    pokemonList: PartyPokemon[],
): SuggestedPokemon[] => {
    const usedPokemonIds: number[] = [];

    const lead = pickBestPokemon(pokemonList, usedPokemonIds, "lead_score");

    if (lead.pokemon) {
        usedPokemonIds.push(lead.pokemon.id);
    }

    const switchPokemon = pickBestPokemon(
        pokemonList,
        usedPokemonIds,
        "switch_score",
    );

    if (switchPokemon.pokemon) {
        usedPokemonIds.push(switchPokemon.pokemon.id);
    }

    const finisher = pickBestPokemon(
        pokemonList,
        usedPokemonIds,
        "finisher_score",
    );

    return [
        {
            role: "lead",
            label: "初手",
            pokemon: lead.pokemon,
            score: lead.score,
            reason: buildReason(lead.pokemon, "lead_score"),
        },
        {
            role: "switch",
            label: "引き先",
            pokemon: switchPokemon.pokemon,
            score: switchPokemon.score,
            reason: buildReason(switchPokemon.pokemon, "switch_score"),
        },
        {
            role: "finisher",
            label: "勝ち筋",
            pokemon: finisher.pokemon,
            score: finisher.score,
            reason: buildReason(finisher.pokemon, "finisher_score"),
        },
    ];
};
