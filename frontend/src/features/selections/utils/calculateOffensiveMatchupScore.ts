import { calculateTypeMultiplier } from "@/features/battlePreview/utils/calculateTypeMultiplier";

export type OffensiveTargetResult = {
    opponentKey: string;
    opponentFormKey: string;
    opponentName: string;
    bestMultiplier: number;
    bestMoveType: string | null;
};

export type OffensiveMatchupResult = {
    score: number;
    superEffectiveTargetCount: number;
    fourTimesEffectiveTargetCount: number;
    neutralOrBetterTargetCount: number;
    ineffectiveTargetCount: number;
    targets: OffensiveTargetResult[];
    reasons: string[];
};

type OpponentPokemon = {
    key: string;
    form_key: string;
    name: string;
    types: string[];
};

type CalculateOffensiveMatchupScoreParams = {
    moveTypes: string[];
    opponentPokemonList: OpponentPokemon[];
};

const convertMultiplierToScore = (multiplier: number): number => {
    if (multiplier >= 4) {
        return 3;
    }

    if (multiplier >= 2) {
        return 2;
    }

    if (multiplier === 1) {
        return 0;
    }

    if (multiplier === 0) {
        return -3;
    }

    if (multiplier <= 0.25) {
        return -2;
    }

    return -1;
};

export const calculateOffensiveMatchupScore = ({
    moveTypes,
    opponentPokemonList,
}: CalculateOffensiveMatchupScoreParams): OffensiveMatchupResult => {
    const uniqueMoveTypes = [...new Set(moveTypes.filter(Boolean))];

    const targets = opponentPokemonList.map((opponentPokemon) => {
        if (uniqueMoveTypes.length === 0) {
            return {
                opponentKey: opponentPokemon.key,
                opponentFormKey: opponentPokemon.form_key,
                opponentName: opponentPokemon.name,
                bestMultiplier: 0,
                bestMoveType: null,
            };
        }

        const matchupList = uniqueMoveTypes.map((moveType) => ({
            moveType,
            multiplier: calculateTypeMultiplier(
                moveType,
                opponentPokemon.types,
            ),
        }));

        const bestMatchup = matchupList.reduce((best, current) =>
            current.multiplier > best.multiplier ? current : best,
        );

        return {
            opponentKey: opponentPokemon.key,
            opponentFormKey: opponentPokemon.form_key,
            opponentName: opponentPokemon.name,
            bestMultiplier: bestMatchup.multiplier,
            bestMoveType: bestMatchup.moveType,
        };
    });

    const score = targets.reduce(
        (total, target) =>
            total + convertMultiplierToScore(target.bestMultiplier),
        0,
    );

    const superEffectiveTargetCount = targets.filter(
        (target) => target.bestMultiplier >= 2,
    ).length;

    const fourTimesEffectiveTargetCount = targets.filter(
        (target) => target.bestMultiplier >= 4,
    ).length;

    const neutralOrBetterTargetCount = targets.filter(
        (target) => target.bestMultiplier >= 1,
    ).length;

    const ineffectiveTargetCount = targets.filter(
        (target) => target.bestMultiplier < 1,
    ).length;

    const reasons: string[] = [];

    if (uniqueMoveTypes.length === 0) {
        reasons.push("採点対象の攻撃技タイプが登録されていません。");
    } else {
        reasons.push(
            `相手${opponentPokemonList.length}匹のうち、${superEffectiveTargetCount}匹に弱点を突けます。`,
        );

        reasons.push(
            `${neutralOrBetterTargetCount}匹に等倍以上の攻撃技があります。`,
        );

        if (fourTimesEffectiveTargetCount > 0) {
            reasons.push(
                `${fourTimesEffectiveTargetCount}匹に4倍弱点を突けます。`,
            );
        }

        if (ineffectiveTargetCount > 0) {
            reasons.push(
                `${ineffectiveTargetCount}匹には半減以下の技しかありません。`,
            );
        }
    }

    return {
        score,
        superEffectiveTargetCount,
        fourTimesEffectiveTargetCount,
        neutralOrBetterTargetCount,
        ineffectiveTargetCount,
        targets,
        reasons,
    };
};
