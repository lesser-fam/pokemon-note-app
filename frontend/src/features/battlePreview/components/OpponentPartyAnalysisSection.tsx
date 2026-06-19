type PokemonRankingItem = {
    key: string;
    form_key: string;
    name: string;
    image_url: string | null;
    value: number;
};

type WeaknessTarget = {
    key: string;
    form_key: string;
    name: string;
    image_url: string | null;
    multiplier: number;
};

type OpponentWeaknessAnalysisItem = {
    attackType: string;
    weakCount: number;
    fourTimesWeakCount: number;
    immuneCount: number;
    targets: WeaknessTarget[];
    immuneTargets: WeaknessTarget[];
};

type OpponentAnalysis = {
    speedRanking: PokemonRankingItem[];
    attackTop3: PokemonRankingItem[];
    specialAttackTop3: PokemonRankingItem[];
    defenseTop3: PokemonRankingItem[];
    specialDefenseTop3: PokemonRankingItem[];
    attackBiasLabel: string;
    attackRate: number;
    specialAttackRate: number;
    defenseBiasLabel: string;
    defenseRate: number;
    specialDefenseRate: number;
};

type OpponentPartyAnalysisSectionProps = {
    opponentPokemonCount: number;
    opponentAnalysis: OpponentAnalysis;
    opponentWeaknessAnalysis: OpponentWeaknessAnalysisItem[];
};

const PokemonIconRanking = ({
    pokemonList,
    valueLabel,
}: {
    pokemonList: PokemonRankingItem[];
    valueLabel: string;
}) => {
    if (pokemonList.length === 0) {
        return (
            <p className="mt-3 text-sm text-gray-600">
                相手ポケモンを入力してください。
            </p>
        );
    }

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {pokemonList.map((pokemon) => (
                <div
                    key={`${pokemon.key}-${pokemon.form_key}-${valueLabel}`}
                    className="rounded bg-white px-2 py-1.5 text-center"
                >
                    {pokemon.image_url ? (
                        <img
                            src={pokemon.image_url}
                            alt={pokemon.name}
                            className="mx-auto h-10 w-10 object-contain"
                        />
                    ) : (
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xs">
                            ?
                        </div>
                    )}

                    <p className="mt-1 text-xs font-semibold">{pokemon.name}</p>

                    <p className="text-xs text-gray-500">
                        {valueLabel}
                        {pokemon.value}
                    </p>
                </div>
            ))}
        </div>
    );
};

const RatioBar = ({
    leftLabel,
    leftRate,
    rightLabel,
    rightRate,
}: {
    leftLabel: string;
    leftRate: number;
    rightLabel: string;
    rightRate: number;
}) => {
    return (
        <div className="mt-3">
            <div className="mb-1 flex justify-between text-sm">
                <span>
                    {leftLabel} {leftRate}%
                </span>

                <span>
                    {rightLabel} {rightRate}%
                </span>
            </div>

            <div className="flex h-3 overflow-hidden rounded bg-gray-200">
                <div
                    className="bg-gray-800"
                    style={{ width: `${leftRate}%` }}
                />

                <div
                    className="bg-gray-400"
                    style={{ width: `${rightRate}%` }}
                />
            </div>
        </div>
    );
};

export const OpponentPartyAnalysisSection = ({
    opponentPokemonCount,
    opponentAnalysis,
    opponentWeaknessAnalysis,
}: OpponentPartyAnalysisSectionProps) => {
    return (
        <section className="mt-8 rounded border p-6">
            <h2 className="text-xl font-bold">相手パーティ簡易分析</h2>

            <p className="mt-1 text-sm text-gray-600">
                入力した相手ポケモンの種族値から、警戒したいポイントを見やすく表示します。
            </p>

            {opponentPokemonCount === 0 ? (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    相手ポケモンを入力すると、ここに分析結果が表示されます。
                </p>
            ) : (
                <div className="mt-4 space-y-6">
                    <div className="rounded bg-gray-50 p-4">
                        <h3 className="font-bold">弱点傾向</h3>

                        <p className="mt-1 text-sm text-gray-600">
                            相手パーティに通りやすい攻撃タイプです。
                        </p>

                        {opponentWeaknessAnalysis.length > 0 ? (
                            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                {opponentWeaknessAnalysis
                                    .slice(0, 6)
                                    .map((item) => (
                                        <div
                                            key={item.attackType}
                                            className="rounded bg-white p-4"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-bold">
                                                        {item.attackType}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-600">
                                                        弱点 {item.weakCount}匹
                                                        {item.fourTimesWeakCount >
                                                            0 &&
                                                            ` / 4倍 ${item.fourTimesWeakCount}匹`}
                                                        {item.immuneCount > 0 &&
                                                            ` / 無効 ${item.immuneCount}匹`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 space-y-3">
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500">
                                                        弱点を突ける相手
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {item.targets.map(
                                                            (target) => (
                                                                <div
                                                                    key={`${item.attackType}-weak-${target.key}-${target.form_key}`}
                                                                    className="flex items-center gap-2 rounded bg-gray-50 px-2 py-1 text-xs"
                                                                >
                                                                    {target.image_url && (
                                                                        <img
                                                                            src={
                                                                                target.image_url
                                                                            }
                                                                            alt={
                                                                                target.name
                                                                            }
                                                                            className="h-8 w-8 object-contain"
                                                                        />
                                                                    )}

                                                                    <span>
                                                                        {
                                                                            target.name
                                                                        }
                                                                    </span>

                                                                    <span className="font-semibold">
                                                                        ×
                                                                        {
                                                                            target.multiplier
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>

                                                {item.immuneTargets.length >
                                                    0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-red-600">
                                                            無効にされる相手
                                                        </p>

                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {item.immuneTargets.map(
                                                                (target) => (
                                                                    <div
                                                                        key={`${item.attackType}-immune-${target.key}-${target.form_key}`}
                                                                        className="flex items-center gap-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700"
                                                                    >
                                                                        {target.image_url && (
                                                                            <img
                                                                                src={
                                                                                    target.image_url
                                                                                }
                                                                                alt={
                                                                                    target.name
                                                                                }
                                                                                className="h-8 w-8 object-contain"
                                                                            />
                                                                        )}

                                                                        <span>
                                                                            {
                                                                                target.name
                                                                            }
                                                                        </span>

                                                                        <span className="font-semibold">
                                                                            ×0
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                                弱点を突けるタイプがまだ見つかりません。
                            </p>
                        )}
                    </div>

                    <div className="rounded bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold">素早さ順</h3>

                            <p className="text-xs text-gray-500">
                                ← 速い　遅い →
                            </p>
                        </div>

                        <PokemonIconRanking
                            pokemonList={opponentAnalysis.speedRanking}
                            valueLabel="S"
                        />
                    </div>

                    <div className="grid gap-3">
                        <div className="rounded bg-gray-50 p-4">
                            <h3 className="font-bold">物理火力 A Top3</h3>

                            <PokemonIconRanking
                                pokemonList={opponentAnalysis.attackTop3}
                                valueLabel="A"
                            />
                        </div>

                        <div className="rounded bg-gray-50 p-4">
                            <h3 className="font-bold">特殊火力 C Top3</h3>

                            <PokemonIconRanking
                                pokemonList={opponentAnalysis.specialAttackTop3}
                                valueLabel="C"
                            />
                        </div>
                    </div>

                    <div className="rounded bg-gray-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="font-bold">火力傾向</h3>

                            <p className="text-sm text-gray-700">
                                {opponentAnalysis.attackBiasLabel}
                            </p>
                        </div>

                        <RatioBar
                            leftLabel="攻撃"
                            leftRate={opponentAnalysis.attackRate}
                            rightLabel="特攻"
                            rightRate={opponentAnalysis.specialAttackRate}
                        />
                    </div>

                    <div className="grid gap-3">
                        <div className="rounded bg-gray-50 p-4">
                            <h3 className="font-bold">物理耐久 B Top3</h3>

                            <PokemonIconRanking
                                pokemonList={opponentAnalysis.defenseTop3}
                                valueLabel="B"
                            />
                        </div>

                        <div className="rounded bg-gray-50 p-4">
                            <h3 className="font-bold">特殊耐久 D Top3</h3>

                            <PokemonIconRanking
                                pokemonList={
                                    opponentAnalysis.specialDefenseTop3
                                }
                                valueLabel="D"
                            />
                        </div>
                    </div>

                    <div className="rounded bg-gray-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="font-bold">耐久傾向</h3>

                            <p className="text-sm text-gray-700">
                                {opponentAnalysis.defenseBiasLabel}
                            </p>
                        </div>

                        <RatioBar
                            leftLabel="防御"
                            leftRate={opponentAnalysis.defenseRate}
                            rightLabel="特防"
                            rightRate={opponentAnalysis.specialDefenseRate}
                        />
                    </div>
                </div>
            )}
        </section>
    );
};
