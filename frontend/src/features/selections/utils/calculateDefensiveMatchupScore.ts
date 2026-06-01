import { calculateTypeMultiplier } from "@/features/battlePreview/utils/calculateTypeMultiplier";

export type DefensiveTargetResult = {
    opponentKey: string;
    opponentFormKey: string;
    opponentName: string;
    worstMultiplier: number;
    worstAttackType: string | null;
};

export type DefensiveMatchupResult = {
    score: number;
    immuneTargetCount: number;
    resistTargetCount: number;
    neutralTargetCount: number;
    weakTargetCount: number;
    targets: DefensiveTargetResult[];
    reasons: string[];
};

type OpponentPokemon = {
    key: string;
    form_key: string;
    name: string;
    types: string[];
};

type CalculateDefensiveMatchupScoreParams = {
    defenderTypes: string[];
    opponentPokemonList: OpponentPokemon[];
};

const convertMultiplierToScore = (multiplier: number): number => {
    if (multiplier === 0) {
        return 3;
    }

    if (multiplier <= 0.25) {
        return 2;
    }

    if (multiplier <= 0.5) {
        return 1;
    }

    if (multiplier === 1) {
        return 0;
    }

    if (multiplier >= 4) {
        return -3;
    }

    return -2;
};

export const calculateDefensiveMatchupScore = ({
    defenderTypes,
    opponentPokemonList,
}: CalculateDefensiveMatchupScoreParams): DefensiveMatchupResult => {
    const targets = opponentPokemonList.map((opponentPokemon) => {
        if (defenderTypes.length === 0 || opponentPokemon.types.length === 0) {
            return {
                opponentKey: opponentPokemon.key,
                opponentFormKey: opponentPokemon.form_key,
                opponentName: opponentPokemon.name,
                worstMultiplier: 1,
                worstAttackType: null,
            };
        }

        const matchupList = opponentPokemon.types.map((attackType) => ({
            attackType,
            multiplier: calculateTypeMultiplier(attackType, defenderTypes),
        }));

        const worstMatchup = matchupList.reduce((worst, current) =>
            current.multiplier > worst.multiplier ? current : worst,
        );

        return {
            opponentKey: opponentPokemon.key,
            opponentFormKey: opponentPokemon.form_key,
            opponentName: opponentPokemon.name,
            worstMultiplier: worstMatchup.multiplier,
            worstAttackType: worstMatchup.attackType,
        };
    });

    const score = targets.reduce(
        (total, target) =>
            total + convertMultiplierToScore(target.worstMultiplier),
        0,
    );

    const immuneTargetCount = targets.filter(
        (target) => target.worstMultiplier === 0,
    ).length;

    const resistTargetCount = targets.filter(
        (target) => target.worstMultiplier > 0 && target.worstMultiplier < 1,
    ).length;

    const neutralTargetCount = targets.filter(
        (target) => target.worstMultiplier === 1,
    ).length;

    const weakTargetCount = targets.filter(
        (target) => target.worstMultiplier > 1,
    ).length;

    const reasons: string[] = [];

    reasons.push(
        `相手${opponentPokemonList.length}匹のうち、${resistTargetCount}匹のタイプ一致技を半減以下にできます。`,
    );

    if (immuneTargetCount > 0) {
        reasons.push(`${immuneTargetCount}匹のタイプ一致技を無効にできます。`);
    }

    if (weakTargetCount > 0) {
        reasons.push(
            `${weakTargetCount}匹から弱点を突かれる可能性があります。`,
        );
    }

    return {
        score,
        immuneTargetCount,
        resistTargetCount,
        neutralTargetCount,
        weakTargetCount,
        targets,
        reasons,
    };
};
