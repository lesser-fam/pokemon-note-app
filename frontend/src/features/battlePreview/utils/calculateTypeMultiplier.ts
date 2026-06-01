import { typeEffectivenessChart } from "@/constants/typeEffectivenessChart";

export const calculateTypeMultiplier = (
    attackType: string,
    defenderTypes: string[],
): number => {
    return defenderTypes.reduce((multiplier, defenderType) => {
        const typeMultiplier =
            typeEffectivenessChart[attackType]?.[defenderType] ?? 1;

        return multiplier * typeMultiplier;
    }, 1);
};
