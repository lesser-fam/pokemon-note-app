import Link from "next/link";

type BattleLogCreateNavigationSectionProps = {
    battleLogCreateHref: string;
    canCreateBattleLog: boolean;
    opponentPokemonCount: number;
    selectedPokemonCount: number;
    selectionPokemonLimit: number;
};

export const BattleLogCreateNavigationSection = ({
    battleLogCreateHref,
    canCreateBattleLog,
    opponentPokemonCount,
    selectedPokemonCount,
    selectionPokemonLimit,
}: BattleLogCreateNavigationSectionProps) => {
    return (
        <section className="sticky bottom-0 z-10 rounded border bg-white/95 p-3 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-bold">選出を決めたら</h2>

                    <p className="mt-1 text-xs text-gray-500">
                        相手パーティと、自分の選出
                        {selectionPokemonLimit}
                        匹を引き継いで対戦ログ作成画面へ進みます。
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
                </div>

                <Link
                    href={battleLogCreateHref}
                    className={`rounded px-4 py-2 text-sm text-white ${
                        canCreateBattleLog
                            ? "bg-black hover:bg-gray-800"
                            : "pointer-events-none bg-gray-400"
                    }`}
                >
                    対戦ログ作成へ
                </Link>
            </div>
        </section>
    );
};
