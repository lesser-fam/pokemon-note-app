type BattlePreviewRecommendationNoticeProps = {
    opponentPokemonCount: number;
    suggestionCount: number;
};

export const BattlePreviewRecommendationNotice = ({
    opponentPokemonCount,
    suggestionCount,
}: BattlePreviewRecommendationNoticeProps) => {
    if (opponentPokemonCount === 0) {
        return (
            <section className="rounded border border-blue-200 bg-blue-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="text-sm font-bold text-blue-900">
                            相手を入力すると、おすすめ選出βが出ます
                        </h2>

                        <p className="mt-1 text-xs text-blue-800">
                            まずは下の検索から相手ポケモンを追加してください。
                        </p>
                    </div>

                    <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-blue-700">
                        未計算
                    </span>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded border border-blue-200 bg-blue-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-bold text-blue-900">
                        おすすめ選出βを確認できます
                    </h2>

                    {/* <p className="mt-1 text-xs text-blue-800">
                        相手{opponentPokemonCount}
                        匹をもとに、攻撃相性・防御相性・過去ログなどから候補を出しています。
                    </p> */}
                </div>

                <a
                    href="#matchup-selection-suggestions"
                    className="rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                    おすすめを見る
                </a>
            </div>

            {suggestionCount > 0 && (
                <p className="mt-2 text-xs text-blue-800">
                    現在 {suggestionCount} 件の候補があります。
                </p>
            )}
        </section>
    );
};
