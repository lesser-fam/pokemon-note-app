import { calculateTypeMultiplier } from "@/features/battlePreview/utils/calculateTypeMultiplier";
import {
    findCommonMoveAttackTypes,
    type CommonMoveAttackTypeMap,
} from "@/features/selections/utils/createCommonMoveAttackTypeMap";
import type { MatchupEffectRule } from "@/types/battleMaster";
import { applyDefensiveMatchupEffects } from "./applyDefensiveMatchupEffects";

export type DefensiveTargetResult = {
    opponentKey: string;
    opponentFormKey: string;
    opponentName: string;
    worstMultiplier: number;
    worstAttackType: string | null;
    reasons: string[];
    commonMoveScoreModifier: number;
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
    abilityEffectRules?: MatchupEffectRule[];
    itemEffectRules?: MatchupEffectRule[];
    commonMoveAttackTypeMap?: CommonMoveAttackTypeMap;
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

const convertCommonMoveMultiplierToModifier = (multiplier: number): number => {
    if (multiplier === 0 || multiplier <= 0.5) {
        return 1;
    }

    if (multiplier >= 2) {
        return -1;
    }

    return 0;
};

const clampCommonMoveScoreModifier = (modifier: number): number =>
    Math.max(-2, Math.min(2, modifier));

export const calculateDefensiveMatchupScore = ({
    defenderTypes,
    opponentPokemonList,
    abilityEffectRules = [],
    itemEffectRules = [],
    commonMoveAttackTypeMap,
}: CalculateDefensiveMatchupScoreParams): DefensiveMatchupResult => {
    const targets = opponentPokemonList.map((opponentPokemon) => {
        if (defenderTypes.length === 0 || opponentPokemon.types.length === 0) {
            return {
                opponentKey: opponentPokemon.key,
                opponentFormKey: opponentPokemon.form_key,
                opponentName: opponentPokemon.name,
                worstMultiplier: 1,
                worstAttackType: null,
                reasons: [],
                commonMoveScoreModifier: 0,
            };
        }

        const matchupList = opponentPokemon.types.map((attackType) => {
            const baseMultiplier = calculateTypeMultiplier(
                attackType,
                defenderTypes,
            );

            const adjustedResult = applyDefensiveMatchupEffects({
                attackType,
                baseMultiplier,
                abilityEffectRules,
                itemEffectRules,
            });

            return {
                attackType,
                multiplier: adjustedResult.multiplier,
                reasons: adjustedResult.reasons,
            };
        });

        const worstMatchup = matchupList.reduce((worst, current) =>
            current.multiplier > worst.multiplier ? current : worst,
        );

        const commonMoveAttackTypes = commonMoveAttackTypeMap
            ? findCommonMoveAttackTypes({
                  attackTypeMap: commonMoveAttackTypeMap,
                  pokemonKey: opponentPokemon.key,
                  formKey: opponentPokemon.form_key,
              })
            : [];

        const commonMoveMatchups = commonMoveAttackTypes.map((attackType) => {
            const baseMultiplier = calculateTypeMultiplier(
                attackType,
                defenderTypes,
            );

            const adjustedResult = applyDefensiveMatchupEffects({
                attackType,
                baseMultiplier,
                abilityEffectRules,
                itemEffectRules,
            });

            return {
                attackType,
                multiplier: adjustedResult.multiplier,
            };
        });

        const worstCommonMoveMatchup = commonMoveMatchups.reduce<
            { attackType: string | null; multiplier: number } | null
        >(
            (worst, current) =>
                !worst || current.multiplier > worst.multiplier
                    ? current
                    : worst,
            null,
        );

        return {
            opponentKey: opponentPokemon.key,
            opponentFormKey: opponentPokemon.form_key,
            opponentName: opponentPokemon.name,
            worstMultiplier: worstMatchup.multiplier,
            worstAttackType: worstMatchup.attackType,
            reasons: worstMatchup.reasons,
            commonMoveScoreModifier: worstCommonMoveMatchup
                ? convertCommonMoveMultiplierToModifier(
                      worstCommonMoveMatchup.multiplier,
                  )
                : 0,
        };
    });

    const baseScore = targets.reduce(
        (total, target) =>
            total + convertMultiplierToScore(target.worstMultiplier),
        0,
    );

    const commonMoveScoreModifier = clampCommonMoveScoreModifier(
        targets.reduce(
            (total, target) => total + target.commonMoveScoreModifier,
            0,
        ),
    );

    const score = baseScore + commonMoveScoreModifier;

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

    if (commonMoveScoreModifier > 0) {
        reasons.push(
            `登録済みのよく使われる攻撃技も一部受けやすいため、防御評価に${commonMoveScoreModifier}点加算されています。`,
        );
    } else if (commonMoveScoreModifier < 0) {
        reasons.push(
            `登録済みのよく使われる攻撃技で弱点を突かれる可能性があるため、防御評価から${Math.abs(commonMoveScoreModifier)}点減算されています。`,
        );
    }

    const effectReasons = targets.flatMap((target) => target.reasons);

    reasons.push(...effectReasons);

    const uniqueReasons = Array.from(new Set(reasons));

    return {
        score,
        immuneTargetCount,
        resistTargetCount,
        neutralTargetCount,
        weakTargetCount,
        targets,
        reasons: uniqueReasons,
    };
};
