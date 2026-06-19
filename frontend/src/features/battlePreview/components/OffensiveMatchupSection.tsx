import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type OffensiveMatchupTarget = {
    opponentKey: string;
    opponentFormKey: string;
    opponentName: string;
    bestMoveType: string | null;
    bestMultiplier: number;
};

type OffensiveMatchupResult = {
    score: number;
    superEffectiveTargetCount: number;
    neutralOrBetterTargetCount: number;
    targets: OffensiveMatchupTarget[];
    reasons: string[];
};

type OffensiveMatchupResultItem = {
    partyPokemon: PartyPokemon;
    matchupResult: OffensiveMatchupResult;
};

type OffensiveMatchupSectionProps = {
    opponentPokemonCount: number;
    currentPokemonCount: number;
    offensiveMatchupResults: OffensiveMatchupResultItem[];
    pokemonList: Pokemon[];
};

const getPartyPokemonDisplayName = (
    partyPokemon: PartyPokemon,
    pokemonList: Pokemon[],
) => {
    const pokemonMaster = findPokemonMaster({
        pokemonList,
        pokemonKey: partyPokemon.pokemon_key,
        formKey: partyPokemon.form_key,
    });

    return (
        partyPokemon.nickname || pokemonMaster?.name || partyPokemon.pokemon_key
    );
};

export const OffensiveMatchupSection = ({
    opponentPokemonCount,
    currentPokemonCount,
    offensiveMatchupResults,
    pokemonList,
}: OffensiveMatchupSectionProps) => {
    return (
        <section className="mt-8 rounded border p-6">
            <h2 className="text-xl font-bold">自分側の攻撃相性</h2>

            <p className="mt-1 text-sm text-gray-600">
                登録した攻撃技タイプを使い、相手ポケモンごとに最も通る技を基準として簡易採点します。
            </p>

            <p className="mt-1 text-xs text-gray-500">
                変化技は採点対象にしないため、技登録時に「タイプなし・変化技」を選択してください。
            </p>

            {opponentPokemonCount === 0 ? (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    相手ポケモンを入力すると、攻撃相性点が表示されます。
                </p>
            ) : currentPokemonCount === 0 ? (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    自分のパーティにポケモンを登録してください。
                </p>
            ) : (
                <div className="mt-4 space-y-4">
                    {offensiveMatchupResults.map(
                        ({ partyPokemon, matchupResult }) => {
                            const pokemonMaster = findPokemonMaster({
                                pokemonList,
                                pokemonKey: partyPokemon.pokemon_key,
                                formKey: partyPokemon.form_key,
                            });

                            return (
                                <div
                                    key={partyPokemon.id}
                                    className="rounded bg-gray-50 p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            {pokemonMaster?.image_url ? (
                                                <img
                                                    src={
                                                        pokemonMaster.image_url
                                                    }
                                                    alt={pokemonMaster.name}
                                                    className="h-14 w-14 object-contain"
                                                />
                                            ) : (
                                                <div className="flex h-14 w-14 items-center justify-center rounded bg-white text-sm">
                                                    ?
                                                </div>
                                            )}

                                            <div>
                                                <p className="font-bold">
                                                    {getPartyPokemonDisplayName(
                                                        partyPokemon,
                                                        pokemonList,
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-600">
                                                    弱点を突ける相手：
                                                    {
                                                        matchupResult.superEffectiveTargetCount
                                                    }
                                                    匹 / 等倍以上：
                                                    {
                                                        matchupResult.neutralOrBetterTargetCount
                                                    }
                                                    匹
                                                </p>
                                            </div>
                                        </div>

                                        <span className="rounded bg-white px-3 py-1 text-sm font-semibold">
                                            攻撃相性点 {matchupResult.score}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {matchupResult.targets.map((target) => (
                                            <span
                                                key={`${partyPokemon.id}-${target.opponentKey}-${target.opponentFormKey}`}
                                                className={`rounded px-2 py-1 text-xs ${
                                                    target.bestMultiplier >= 2
                                                        ? "bg-green-100 text-green-700"
                                                        : target.bestMultiplier <
                                                            1
                                                          ? "bg-red-100 text-red-700"
                                                          : "bg-white text-gray-700"
                                                }`}
                                            >
                                                {target.opponentName}：{" "}
                                                {target.bestMoveType
                                                    ? `${target.bestMoveType} ×${target.bestMultiplier}`
                                                    : "攻撃技タイプ未登録"}
                                            </span>
                                        ))}
                                    </div>

                                    <ul className="mt-3 space-y-1 text-xs text-gray-600">
                                        {matchupResult.reasons.map((reason) => (
                                            <li key={reason}>・{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        },
                    )}
                </div>
            )}
        </section>
    );
};
