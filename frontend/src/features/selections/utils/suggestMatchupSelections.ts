import { calculateDefensiveMatchupScore } from "@/features/selections/utils/calculateDefensiveMatchupScore";
import { calculateOffensiveMatchupScore } from "@/features/selections/utils/calculateOffensiveMatchupScore";
import type { BattleLog, PartyPokemon, SelectionTemplate } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type SelectionRole = "lead" | "switch" | "finisher";

type PokemonScoreBreakdown = {
    roleTagScore: number;
    offensiveScore: number;
    defensiveScore: number;
    speedScore: number;
    battleLogScore: number;
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
    battleLogs: BattleLog[];
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

const getSpeedMultiplier = (partyPokemon: PartyPokemon): number => {
    const speedMultiplierRule = partyPokemon.item_master?.effect_rules?.find(
        (rule) => rule.effect_type === "speed_multiplier",
    );

    return speedMultiplierRule?.value ?? 1;
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

    const speedMultiplier = getSpeedMultiplier(partyPokemon);

    const adjustedSpeed = pokemonMaster.base_stats.s * speedMultiplier;

    const fasterTargetCount = opponentPokemonList.filter(
        (opponentPokemon) => adjustedSpeed > opponentPokemon.base_stats.s,
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

const getBattleLogBonus = (
    partyPokemon: PartyPokemon,
    role: SelectionRole,
    opponentPokemonList: Pokemon[],
    battleLogs: BattleLog[],
): number => {
    const opponentKeys = new Set(
        opponentPokemonList.map(
            (pokemon) => `${pokemon.key}:${pokemon.form_key}`,
        ),
    );

    const matchedLogCount = battleLogs.filter((battleLog) => {
        if (!battleLog.heavy_opponent_key || !battleLog.needed_pokemon) {
            return false;
        }

        const heavyOpponentKey = `${battleLog.heavy_opponent_key}:${battleLog.heavy_opponent_form || "default"}`;

        return (
            opponentKeys.has(heavyOpponentKey) &&
            battleLog.needed_pokemon.id === partyPokemon.id
        );
    }).length;

    if (role === "switch") {
        return Math.min(matchedLogCount * 2, 4);
    }

    return Math.min(matchedLogCount, 2);
};

const getPokemonScore = (
    partyPokemon: PartyPokemon,
    role: SelectionRole,
    pokemonMasterList: Pokemon[],
    opponentPokemonList: Pokemon[],
    battleLogs: BattleLog[],
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
        abilityEffectRules: partyPokemon.ability_master?.effect_rules ?? [],
        itemEffectRules: partyPokemon.item_master?.effect_rules ?? [],
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

    const battleLogScore = getBattleLogBonus(
        partyPokemon,
        role,
        opponentPokemonList,
        battleLogs,
    );

    return {
        roleTagScore,
        offensiveScore,
        defensiveScore,
        speedScore,
        battleLogScore,
        totalScore:
            roleTagScore +
            offensiveScore +
            defensiveScore +
            speedScore +
            battleLogScore,
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
    battleLogs,
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
                    battleLogs,
                );

                const switchBreakdown = getPokemonScore(
                    switchPokemon,
                    "switch",
                    pokemonMasterList,
                    opponentPokemonList,
                    battleLogs,
                );

                const finisherBreakdown = getPokemonScore(
                    finisherPokemon,
                    "finisher",
                    pokemonMasterList,
                    opponentPokemonList,
                    battleLogs,
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

                if (leadBreakdown.battleLogScore > 0) {
                    reasons.push(
                        `初手は過去ログから ${leadBreakdown.battleLogScore}点加算されています。`,
                    );
                }

                if (switchBreakdown.battleLogScore > 0) {
                    reasons.push(
                        `引き先は過去ログの「必要だった味方」記録から ${switchBreakdown.battleLogScore}点加算されています。`,
                    );
                }

                if (finisherBreakdown.battleLogScore > 0) {
                    reasons.push(
                        `勝ち筋は過去ログから ${finisherBreakdown.battleLogScore}点加算されています。`,
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
