import { calculateDefensiveMatchupScore } from "@/features/selections/utils/calculateDefensiveMatchupScore";
import { calculateOffensiveMatchupScore } from "@/features/selections/utils/calculateOffensiveMatchupScore";
import type { PartyPokemon, SelectionTemplate } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type SelectionRole = "lead" | "switch" | "finisher";

type PokemonScoreBreakdown = {
    roleTagScore: number;
    offensiveScore: number;
    defensiveScore: number;
    speedScore: number;
    totalScore: number;
};

export type MatchupSelectionSuggestion = {
    leadPokemon: PartyPokemon;
    switchPokemon: PartyPokemon;
    finisherPokemon: PartyPokemon;
    totalScore: number;
    savedTemplateBonus: number;
    leadBreakdown: PokemonScoreBreakdown;
    switchBreakdown: PokemonScoreBreakdown;
    finisherBreakdown: PokemonScoreBreakdown;
    reasons: string[];
};

type SuggestMatchupSelectionsParams = {
    partyPokemonList: PartyPokemon[];
    pokemonMasterList: Pokemon[];
    opponentPokemonList: Pokemon[];
    savedSelectionTemplates: SelectionTemplate[];
};

const getRoleTagScore = (
    partyPokemon: PartyPokemon,
    role: SelectionRole,
): number => {
    return (partyPokemon.role_tags ?? []).reduce((total, tag) => {
        if (role === "lead") {
            return total + tag.lead_score;
        }

        if (role === "switch") {
            return total + tag.switch_score;
        }

        return total + tag.finisher_score;
    }, 0);
};

const getSpeedScore = (
    partyPokemon: PartyPokemon,
    pokemonMaster: Pokemon | undefined,
    opponentPokemonList: Pokemon[],
    role: SelectionRole,
): number => {
    if (!pokemonMaster || role === "switch") {
        return 0;
    }

    const fasterTargetCount = opponentPokemonList.filter(
        (opponentPokemon) =>
            pokemonMaster.base_stats.s > opponentPokemon.base_stats.s,
    ).length;

    let score = 0;

    if (fasterTargetCount >= 5) {
        score += 2;
    } else if (fasterTargetCount >= 3) {
        score += 1;
    }

    if ((partyPokemon.ev_s ?? 0) > 0) {
        score += 1;
    }

    return Math.min(score, 3);
};

const getPokemonScore = (
    partyPokemon: PartyPokemon,
    role: SelectionRole,
    pokemonMasterList: Pokemon[],
    opponentPokemonList: Pokemon[],
): PokemonScoreBreakdown => {
    const pokemonMaster = pokemonMasterList.find(
        (pokemon) =>
            pokemon.key === partyPokemon.pokemon_key &&
            pokemon.form_key === partyPokemon.form_key,
    );

    const moveTypes = [
        partyPokemon.move_1_type,
        partyPokemon.move_2_type,
        partyPokemon.move_3_type,
        partyPokemon.move_4_type,
    ].filter((moveType): moveType is string => Boolean(moveType));

    const offensiveResult = calculateOffensiveMatchupScore({
        moveTypes,
        opponentPokemonList,
    });

    const defensiveResult = calculateDefensiveMatchupScore({
        defenderTypes: pokemonMaster?.types ?? [],
        opponentPokemonList,
    });

    const roleTagScore = getRoleTagScore(partyPokemon, role);
    const speedScore = getSpeedScore(
        partyPokemon,
        pokemonMaster,
        opponentPokemonList,
        role,
    );

    let offensiveScore = offensiveResult.score;
    let defensiveScore = defensiveResult.score;

    if (role === "switch") {
        offensiveScore = Math.round(offensiveScore * 0.5);
        defensiveScore = Math.round(defensiveScore * 1.5);
    }

    if (role === "finisher") {
        offensiveScore = Math.round(offensiveScore * 1.5);
        defensiveScore = Math.round(defensiveScore * 0.5);
    }

    return {
        roleTagScore,
        offensiveScore,
        defensiveScore,
        speedScore,
        totalScore: roleTagScore + offensiveScore + defensiveScore + speedScore,
    };
};

const getSavedTemplateBonus = (
    leadPokemon: PartyPokemon,
    switchPokemon: PartyPokemon,
    finisherPokemon: PartyPokemon,
    savedSelectionTemplates: SelectionTemplate[],
): number => {
    return savedSelectionTemplates.reduce((highestBonus, template) => {
        let bonus = 0;

        if (template.lead_pokemon?.id === leadPokemon.id) {
            bonus += 1;
        }

        if (template.switch_pokemon?.id === switchPokemon.id) {
            bonus += 1;
        }

        if (template.finisher_pokemon?.id === finisherPokemon.id) {
            bonus += 1;
        }

        const isPerfectMatch =
            template.lead_pokemon?.id === leadPokemon.id &&
            template.switch_pokemon?.id === switchPokemon.id &&
            template.finisher_pokemon?.id === finisherPokemon.id;

        if (isPerfectMatch) {
            bonus += 3;
        }

        return Math.max(highestBonus, bonus);
    }, 0);
};

export const suggestMatchupSelections = ({
    partyPokemonList,
    pokemonMasterList,
    opponentPokemonList,
    savedSelectionTemplates,
}: SuggestMatchupSelectionsParams): MatchupSelectionSuggestion[] => {
    if (partyPokemonList.length < 3 || opponentPokemonList.length === 0) {
        return [];
    }

    const suggestions: MatchupSelectionSuggestion[] = [];

    partyPokemonList.forEach((leadPokemon) => {
        partyPokemonList.forEach((switchPokemon) => {
            if (switchPokemon.id === leadPokemon.id) {
                return;
            }

            partyPokemonList.forEach((finisherPokemon) => {
                if (
                    finisherPokemon.id === leadPokemon.id ||
                    finisherPokemon.id === switchPokemon.id
                ) {
                    return;
                }

                const leadBreakdown = getPokemonScore(
                    leadPokemon,
                    "lead",
                    pokemonMasterList,
                    opponentPokemonList,
                );

                const switchBreakdown = getPokemonScore(
                    switchPokemon,
                    "switch",
                    pokemonMasterList,
                    opponentPokemonList,
                );

                const finisherBreakdown = getPokemonScore(
                    finisherPokemon,
                    "finisher",
                    pokemonMasterList,
                    opponentPokemonList,
                );

                const savedTemplateBonus = getSavedTemplateBonus(
                    leadPokemon,
                    switchPokemon,
                    finisherPokemon,
                    savedSelectionTemplates,
                );

                const totalScore =
                    leadBreakdown.totalScore +
                    switchBreakdown.totalScore +
                    finisherBreakdown.totalScore +
                    savedTemplateBonus;

                const reasons: string[] = [];

                if (leadBreakdown.roleTagScore > 0) {
                    reasons.push(
                        `初手は役割タグから ${leadBreakdown.roleTagScore}点加算されています。`,
                    );
                }

                if (switchBreakdown.defensiveScore > 0) {
                    reasons.push(
                        `引き先は防御相性から ${switchBreakdown.defensiveScore}点加算されています。`,
                    );
                }

                if (finisherBreakdown.offensiveScore > 0) {
                    reasons.push(
                        `勝ち筋は攻撃相性から ${finisherBreakdown.offensiveScore}点加算されています。`,
                    );
                }

                if (savedTemplateBonus > 0) {
                    reasons.push(
                        `保存済み基本選出との一致により ${savedTemplateBonus}点加算されています。`,
                    );
                }

                suggestions.push({
                    leadPokemon,
                    switchPokemon,
                    finisherPokemon,
                    totalScore,
                    savedTemplateBonus,
                    leadBreakdown,
                    switchBreakdown,
                    finisherBreakdown,
                    reasons,
                });
            });
        });
    });

    return suggestions.sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
};
