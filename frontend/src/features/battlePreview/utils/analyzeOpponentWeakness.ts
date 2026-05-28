import { pokemonTypes } from "@/constants/pokemonTypes";
import { typeEffectivenessChart } from "@/constants/typeEffectivenessChart";
import type { Pokemon } from "@/types/pokemon";

export type WeaknessTarget = {
    key: string;
    form_key: string;
    name: string;
    image_url: string | null;
    multiplier: number;
};

export type WeaknessAnalysisItem = {
    attackType: string;
    weakCount: number;
    fourTimesWeakCount: number;
    resistCount: number;
    immuneCount: number;
    totalScore: number;
    targets: WeaknessTarget[];
    immuneTargets: WeaknessTarget[];
};

const calculateMultiplier = (
    attackType: string,
    defenderTypes: string[],
): number => {
    return defenderTypes.reduce((multiplier, defenderType) => {
        const typeMultiplier =
            typeEffectivenessChart[attackType]?.[defenderType] ?? 1;

        return multiplier * typeMultiplier;
    }, 1);
};

export const analyzeOpponentWeakness = (
    opponentPokemonList: Pokemon[],
): WeaknessAnalysisItem[] => {
    return pokemonTypes
        .map((attackType) => {
            const targets = opponentPokemonList.map((pokemon) => {
                const multiplier = calculateMultiplier(
                    attackType,
                    pokemon.types,
                );

                return {
                    key: pokemon.key,
                    form_key: pokemon.form_key,
                    name: pokemon.name,
                    image_url: pokemon.image_url,
                    multiplier,
                };
            });

            const weakTargets = targets.filter(
                (target) => target.multiplier > 1,
            );

            const immuneTargets = targets.filter(
                (target) => target.multiplier === 0,
            );

            const weakCount = weakTargets.length;
            const fourTimesWeakCount = targets.filter(
                (target) => target.multiplier >= 4,
            ).length;
            const resistCount = targets.filter(
                (target) => target.multiplier > 0 && target.multiplier < 1,
            ).length;
            const immuneCount = targets.filter(
                (target) => target.multiplier === 0,
            ).length;

            const totalScore = targets.reduce((score, target) => {
                if (target.multiplier >= 4) {
                    return score + 3;
                }

                if (target.multiplier === 2) {
                    return score + 2;
                }

                if (target.multiplier === 1) {
                    return score + 1;
                }

                if (target.multiplier === 0) {
                    return score - 2;
                }

                return score;
            }, 0);

            return {
                attackType,
                weakCount,
                fourTimesWeakCount,
                resistCount,
                immuneCount,
                totalScore,
                targets: weakTargets.sort(
                    (a, b) => b.multiplier - a.multiplier,
                ),
                immuneTargets,
            };
        })
        .filter((item) => item.weakCount > 0)
        .sort((a, b) => {
            if (b.weakCount !== a.weakCount) {
                return b.weakCount - a.weakCount;
            }

            if (b.fourTimesWeakCount !== a.fourTimesWeakCount) {
                return b.fourTimesWeakCount - a.fourTimesWeakCount;
            }

            return b.totalScore - a.totalScore;
        });
};
