import type { Pokemon } from "@/types/pokemon";

export type OpponentPartyAnalysisPokemon = {
    key: string;
    form_key: string;
    name: string;
    image_url: string | null;
    value: number;
};

export type OpponentPartyAnalysis = {
    attackTotal: number;
    specialAttackTotal: number;
    defenseTotal: number;
    specialDefenseTotal: number;

    attackRate: number;
    specialAttackRate: number;
    defenseRate: number;
    specialDefenseRate: number;

    attackBiasLabel: string;
    defenseBiasLabel: string;

    speedRanking: OpponentPartyAnalysisPokemon[];
    attackTop3: OpponentPartyAnalysisPokemon[];
    specialAttackTop3: OpponentPartyAnalysisPokemon[];
    defenseTop3: OpponentPartyAnalysisPokemon[];
    specialDefenseTop3: OpponentPartyAnalysisPokemon[];
};

const calculateRate = (value: number, total: number): number => {
    if (total === 0) {
        return 0;
    }

    return Math.round((value / total) * 100);
};

const toAnalysisPokemon = (
    pokemon: Pokemon,
    value: number,
): OpponentPartyAnalysisPokemon => {
    return {
        key: pokemon.key,
        form_key: pokemon.form_key,
        name: pokemon.name,
        image_url: pokemon.image_url,
        value,
    };
};

const pickTopPokemon = (
    pokemonList: Pokemon[],
    getValue: (pokemon: Pokemon) => number,
    limit = 3,
): OpponentPartyAnalysisPokemon[] => {
    return [...pokemonList]
        .sort((a, b) => getValue(b) - getValue(a))
        .slice(0, limit)
        .map((pokemon) => toAnalysisPokemon(pokemon, getValue(pokemon)));
};

export const analyzeOpponentParty = (
    pokemonList: Pokemon[],
): OpponentPartyAnalysis => {
    const attackTotal = pokemonList.reduce(
        (total, pokemon) => total + pokemon.base_stats.a,
        0,
    );

    const specialAttackTotal = pokemonList.reduce(
        (total, pokemon) => total + pokemon.base_stats.c,
        0,
    );

    const defenseTotal = pokemonList.reduce(
        (total, pokemon) => total + pokemon.base_stats.b,
        0,
    );

    const specialDefenseTotal = pokemonList.reduce(
        (total, pokemon) => total + pokemon.base_stats.d,
        0,
    );

    const attackAndSpecialAttackTotal = attackTotal + specialAttackTotal;
    const defenseAndSpecialDefenseTotal = defenseTotal + specialDefenseTotal;

    const attackRate = calculateRate(attackTotal, attackAndSpecialAttackTotal);
    const specialAttackRate = calculateRate(
        specialAttackTotal,
        attackAndSpecialAttackTotal,
    );

    const defenseRate = calculateRate(
        defenseTotal,
        defenseAndSpecialDefenseTotal,
    );
    const specialDefenseRate = calculateRate(
        specialDefenseTotal,
        defenseAndSpecialDefenseTotal,
    );

    const attackBiasLabel =
        attackTotal > specialAttackTotal
            ? "物理火力寄り"
            : attackTotal < specialAttackTotal
              ? "特殊火力寄り"
              : "物理・特殊が同じくらい";

    const defenseBiasLabel =
        defenseTotal > specialDefenseTotal
            ? "物理耐久寄り"
            : defenseTotal < specialDefenseTotal
              ? "特殊耐久寄り"
              : "物理耐久・特殊耐久が同じくらい";

    const speedRanking = pickTopPokemon(
        pokemonList,
        (pokemon) => pokemon.base_stats.s,
        6,
    );

    const attackTop3 = pickTopPokemon(
        pokemonList,
        (pokemon) => pokemon.base_stats.a,
    );

    const specialAttackTop3 = pickTopPokemon(
        pokemonList,
        (pokemon) => pokemon.base_stats.c,
    );

    const defenseTop3 = pickTopPokemon(
        pokemonList,
        (pokemon) => pokemon.base_stats.b,
    );

    const specialDefenseTop3 = pickTopPokemon(
        pokemonList,
        (pokemon) => pokemon.base_stats.d,
    );

    return {
        attackTotal,
        specialAttackTotal,
        defenseTotal,
        specialDefenseTotal,

        attackRate,
        specialAttackRate,
        defenseRate,
        specialDefenseRate,

        attackBiasLabel,
        defenseBiasLabel,

        speedRanking,
        attackTop3,
        specialAttackTop3,
        defenseTop3,
        specialDefenseTop3,
    };
};
