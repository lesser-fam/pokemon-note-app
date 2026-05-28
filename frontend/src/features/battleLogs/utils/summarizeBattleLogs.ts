import type { BattleLog } from "@/types/party";

export type CountSummary = {
    key: string;
    label: string;
    count: number;
};

export type BattleLogSummary = {
    totalBattles: number;
    winCount: number;
    loseCount: number;
    winRate: number;
    heavyOpponentCounts: CountSummary[];
    neededPokemonCounts: CountSummary[];
    lossTagCounts: CountSummary[];
};

const countByKey = (
    items: { key: string; label: string }[],
): CountSummary[] => {
    const map = new Map<string, CountSummary>();

    items.forEach((item) => {
        const current = map.get(item.key);

        if (current) {
            map.set(item.key, {
                ...current,
                count: current.count + 1,
            });

            return;
        }

        map.set(item.key, {
            key: item.key,
            label: item.label,
            count: 1,
        });
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
};

export const summarizeBattleLogs = (
    battleLogs: BattleLog[],
): BattleLogSummary => {
    const totalBattles = battleLogs.length;
    const winCount = battleLogs.filter((log) => log.result === "win").length;
    const loseCount = battleLogs.filter((log) => log.result === "lose").length;

    const winRate =
        totalBattles > 0 ? Math.round((winCount / totalBattles) * 100) : 0;

    const heavyOpponentCounts = countByKey(
        battleLogs
            .filter((log) => log.heavy_opponent_key)
            .map((log) => ({
                key: `${log.heavy_opponent_key}:${log.heavy_opponent_form ?? "default"}`,
                label: log.heavy_opponent_key ?? "",
            })),
    );

    const neededPokemonCounts = countByKey(
        battleLogs
            .filter((log) => log.needed_pokemon)
            .map((log) => ({
                key: String(log.needed_pokemon!.id),
                label:
                    log.needed_pokemon!.nickname ||
                    log.needed_pokemon!.pokemon_key,
            })),
    );

    const lossTagCounts = countByKey(
        battleLogs.flatMap((log) =>
            (log.loss_tags ?? []).map((tag) => ({
                key: tag,
                label: tag,
            })),
        ),
    );

    return {
        totalBattles,
        winCount,
        loseCount,
        winRate,
        heavyOpponentCounts,
        neededPokemonCounts,
        lossTagCounts,
    };
};
