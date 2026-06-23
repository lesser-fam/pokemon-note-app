import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type BattleLogSummaryCountItem = {
    key: string;
    label?: string;
    count: number;
};

type BattleLogSummary = {
    totalBattles: number;
    winCount: number;
    loseCount: number;
    winRate: number;
    selectedPokemonCounts: BattleLogSummaryCountItem[];
    heavyOpponentCounts: BattleLogSummaryCountItem[];
    neededPokemonCounts: BattleLogSummaryCountItem[];
    lossTagCounts: BattleLogSummaryCountItem[];
};

type BattleLogSummarySectionProps = {
    battleLogSummary: BattleLogSummary;
    partyPokemonList: PartyPokemon[];
    pokemonList: Pokemon[];
    title?: string;
    description?: string;
};

export const BattleLogSummarySection = ({
    battleLogSummary,
    partyPokemonList,
    pokemonList,
    title = "対戦ログ集計",
    description = "保存した対戦ログから、勝率やよく出る反省ポイントを確認できます。",
}: BattleLogSummarySectionProps) => {
    const findPartyPokemonBySummaryKey = (item: BattleLogSummaryCountItem) => {
        return partyPokemonList.find(
            (partyPokemon) => String(partyPokemon.id) === item.key,
        );
    };

    const renderPartyPokemonSummaryItems = (
        items: BattleLogSummaryCountItem[],
        limit: number,
        layout: "row" | "column" = "column",
    ) => {
        if (items.length === 0) {
            return (
                <p className="mt-3 text-sm text-gray-600">
                    まだ記録がありません。
                </p>
            );
        }

        return (
            <div
                className={
                    layout === "row"
                        ? "mt-3 grid grid-cols-3 gap-2"
                        : "mt-3 space-y-1.5"
                }
            >
                {items.slice(0, limit).map((item) => {
                    const partyPokemon = findPartyPokemonBySummaryKey(item);

                    const pokemonMaster = partyPokemon
                        ? findPokemonMaster({
                              pokemonList,
                              pokemonKey: partyPokemon.pokemon_key,
                              formKey: partyPokemon.form_key,
                          })
                        : undefined;

                    const displayName =
                        partyPokemon?.nickname ||
                        pokemonMaster?.name ||
                        item.label ||
                        item.key;

                    return (
                        <div
                            key={item.key}
                            className="flex min-w-0 items-center gap-2 rounded bg-white px-2 py-1.5"
                            title={displayName}
                        >
                            {pokemonMaster?.image_url ? (
                                <img
                                    src={pokemonMaster.image_url}
                                    alt={pokemonMaster.name}
                                    className="h-8 w-8 shrink-0 object-contain"
                                />
                            ) : (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                                    ?
                                </div>
                            )}

                            <div className="min-w-0">
                                <div
                                    className={
                                        layout === "row"
                                            ? "min-w-0"
                                            : "flex min-w-0 items-baseline gap-1"
                                    }
                                >
                                    <p className="truncate text-xs font-semibold">
                                        {displayName}
                                    </p>

                                    <p className="shrink-0 text-[10px] text-gray-500">
                                        {item.count}回
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderHeavyOpponentSummaryItems = (
        items: BattleLogSummaryCountItem[],
    ) => {
        if (items.length === 0) {
            return (
                <p className="mt-3 text-sm text-gray-600">
                    まだ記録がありません。
                </p>
            );
        }

        return (
            <div className="mt-3 max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {items.map((item) => {
                    const [pokemonKey, formKey] = item.key.split(":");

                    const pokemonMaster = findPokemonMaster({
                        pokemonList,
                        pokemonKey,
                        formKey: formKey || "default",
                    });

                    return (
                        <div
                            key={item.key}
                            className="flex items-center justify-between gap-3 rounded bg-white px-2 py-1.5"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                {pokemonMaster?.image_url ? (
                                    <img
                                        src={pokemonMaster.image_url}
                                        alt={pokemonMaster.name}
                                        className="h-8 w-8 shrink-0 object-contain"
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                                        ?
                                    </div>
                                )}

                                <p className="truncate text-xs font-semibold">
                                    {pokemonMaster?.name ||
                                        item.label ||
                                        pokemonKey}
                                </p>
                            </div>

                            <span className="shrink-0 text-xs text-gray-500">
                                {item.count}回
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <section className="mt-8 rounded border bg-white p-5">
            <h2 className="text-lg font-bold">{title}</h2>

            <p className="mt-1 text-xs text-gray-600">{description}</p>

            {battleLogSummary.totalBattles === 0 ? (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    対戦ログを保存すると、ここに集計が表示されます。
                </p>
            ) : (
                <div className="mt-4 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="min-w-0 rounded bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">対戦数</p>
                                <p className="mt-1 truncate text-2xl font-bold sm:text-3xl">
                                    {battleLogSummary.totalBattles}
                                </p>
                            </div>

                            <div className="min-w-0 rounded bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">勝敗</p>
                                <p className="mt-1 truncate text-xl font-bold sm:text-2xl">
                                    {battleLogSummary.winCount}勝 /{" "}
                                    {battleLogSummary.loseCount}敗
                                </p>
                            </div>

                            <div className="min-w-0 rounded bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">勝率</p>
                                <p className="mt-1 truncate text-2xl font-bold sm:text-3xl">
                                    {battleLogSummary.winRate}%
                                </p>
                            </div>
                        </div>

                        <div className="rounded bg-gray-50 p-3">
                            <h3 className="text-sm font-bold">
                                よく選出する味方
                            </h3>

                            {renderPartyPokemonSummaryItems(
                                battleLogSummary.selectedPokemonCounts,
                                3,
                                "row",
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="rounded bg-gray-50 p-3">
                            <h3 className="text-sm font-bold">
                                よく重かった相手
                            </h3>

                            {renderHeavyOpponentSummaryItems(
                                battleLogSummary.heavyOpponentCounts,
                            )}
                        </div>

                        <div className="rounded bg-gray-50 p-3">
                            <h3 className="whitespace-nowrap text-sm font-bold">
                                よく必要だった味方
                            </h3>

                            {renderPartyPokemonSummaryItems(
                                battleLogSummary.neededPokemonCounts,
                                3,
                            )}
                        </div>

                        <div className="rounded bg-gray-50 p-3">
                            <h3 className="text-sm font-bold">
                                よく出る敗因タグ
                            </h3>

                            {battleLogSummary.lossTagCounts.length > 0 ? (
                                <div className="mt-3 space-y-1.5">
                                    {battleLogSummary.lossTagCounts
                                        .slice(0, 5)
                                        .map((item) => (
                                            <div
                                                key={item.key}
                                                className="flex items-center justify-between gap-3 rounded bg-white px-3 py-2 text-sm"
                                                title={item.label}
                                            >
                                                <span className="truncate">
                                                    {item.label}
                                                </span>

                                                <span className="shrink-0 text-xs text-gray-500">
                                                    {item.count}回
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-gray-600">
                                    まだ記録がありません。
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
