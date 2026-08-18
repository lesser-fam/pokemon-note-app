import Link from "next/link";

type BattleLogCreateNavigationSectionProps = {
    battleLogCreateHref: string;
    canCreateBattleLog: boolean;
    canCreateQuickBattleLog: boolean;
    opponentPokemonCount: number;
    selectedPokemonCount: number;
    selectedOpponentPokemonCount: number;
    selectionPokemonLimit: number;
    isQuickSubmitting: boolean;
    quickErrorMessage: string;
    onCreateQuickBattleLog: (result: "win" | "lose") => void;
};

export const BattleLogCreateNavigationSection = ({
    battleLogCreateHref,
    canCreateBattleLog,
    canCreateQuickBattleLog,
    opponentPokemonCount,
    selectedPokemonCount,
    selectedOpponentPokemonCount,
    selectionPokemonLimit,
    isQuickSubmitting,
    quickErrorMessage,
    onCreateQuickBattleLog,
}: BattleLogCreateNavigationSectionProps) => {
    const isQuickButtonDisabled =
        !canCreateQuickBattleLog || isQuickSubmitting;

    return (
        <section className="sticky bottom-0 z-10 rounded border bg-white/95 p-3 shadow-sm backdrop-blur">
            {quickErrorMessage && (
                <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">
                    {quickErrorMessage}
                </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-bold">選出を決めたら</h2>

                    <p className="mt-1 text-xs text-gray-500">
                        勝敗だけをすぐ保存するか、詳細な対戦ログを作成できます。
                    </p>

                    {opponentPokemonCount === 0 && (
                        <p className="mt-2 text-xs text-red-600">
                            相手ポケモンを1匹以上選んでください。
                        </p>
                    )}

                    {selectedPokemonCount < selectionPokemonLimit && (
                        <p className="mt-1 text-xs text-red-600">
                            自パーティから選出する
                            {selectionPokemonLimit}
                            匹を選んでください。
                        </p>
                    )}

                    {selectedOpponentPokemonCount === 0 && (
                        <p className="mt-1 text-xs text-red-600">
                            相手の実選出を1匹以上選んでください。
                        </p>
                    )}
                </div>

                <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-3">
                    <button
                        type="button"
                        onClick={() => onCreateQuickBattleLog("win")}
                        disabled={isQuickButtonDisabled}
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {isQuickSubmitting ? "保存中..." : "勝ち"}
                    </button>

                    <button
                        type="button"
                        onClick={() => onCreateQuickBattleLog("lose")}
                        disabled={isQuickButtonDisabled}
                        className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {isQuickSubmitting ? "保存中..." : "負け"}
                    </button>

                    <Link
                        href={battleLogCreateHref}
                        className={`col-span-2 rounded px-4 py-2 text-center text-sm text-white sm:col-span-1 ${
                            canCreateBattleLog
                                ? "bg-black hover:bg-gray-800"
                                : "pointer-events-none bg-gray-400"
                        }`}
                    >
                        対戦ログ作成へ
                    </Link>
                </div>
            </div>
        </section>
    );
};
