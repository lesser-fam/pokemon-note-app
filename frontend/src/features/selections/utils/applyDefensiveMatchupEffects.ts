import type { MatchupEffectRule } from "@/types/battleMaster";

type ApplyDefensiveMatchupEffectsParams = {
    attackType: string;
    baseMultiplier: number;
    abilityEffectRules: MatchupEffectRule[];
    itemEffectRules: MatchupEffectRule[];
};

type DefensiveMatchupEffectResult = {
    multiplier: number;
    reasons: string[];
};

const roundMultiplier = (value: number) => {
    return Math.round(value * 1000) / 1000;
};

export const applyDefensiveMatchupEffects = ({
    attackType,
    baseMultiplier,
    abilityEffectRules,
    itemEffectRules,
}: ApplyDefensiveMatchupEffectsParams): DefensiveMatchupEffectResult => {
    let multiplier = baseMultiplier;
    const reasons: string[] = [];

    const immunityRule = abilityEffectRules.find(
        (rule) =>
            rule.effect_type === "type_immunity" &&
            rule.target_type === attackType,
    );

    if (immunityRule) {
        return {
            multiplier: 0,
            reasons: [
                immunityRule.description ||
                    `${attackType}タイプの技を特性で無効にします。`,
            ],
        };
    }

    abilityEffectRules
        .filter(
            (rule) =>
                rule.effect_type === "type_resistance" &&
                rule.target_type === attackType &&
                rule.value !== null,
        )
        .forEach((rule) => {
            multiplier *= rule.value ?? 1;

            reasons.push(
                rule.description ||
                    `${attackType}タイプの技を特性で軽減します。`,
            );
        });

    if (baseMultiplier > 1) {
        abilityEffectRules
            .filter(
                (rule) =>
                    rule.effect_type === "super_effective_damage_reduction" &&
                    rule.value !== null,
            )
            .forEach((rule) => {
                multiplier *= rule.value ?? 1;

                reasons.push(
                    rule.description || "効果抜群の技を特性で軽減します。",
                );
            });
    }

    itemEffectRules
        .filter(
            (rule) =>
                rule.effect_type === "reduce_type_damage" &&
                rule.target_type === attackType &&
                rule.value !== null,
        )
        .forEach((rule) => {
            const canApply =
                rule.condition === "always" ||
                (rule.condition === "super_effective_only" &&
                    baseMultiplier > 1);

            if (!canApply) {
                return;
            }

            multiplier *= rule.value ?? 1;

            reasons.push(
                rule.description ||
                    `${attackType}タイプの技を持ち物で軽減します。`,
            );
        });

    return {
        multiplier: roundMultiplier(multiplier),
        reasons,
    };
};
