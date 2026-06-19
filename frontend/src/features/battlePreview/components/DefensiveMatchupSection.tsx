import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type DefensiveMatchupTarget = {
    opponentKey: string;
    opponentFormKey: string;
    opponentName: string;
    worstAttackType: string | null;
    worstMultiplier: number;
};

type DefensiveMatchupResult = {
    score: number;
    resistTargetCount: number;
    weakTargetCount: number;
    targets: DefensiveMatchupTarget[];
    reasons: string[];
};

type DefensiveMatchupResultItem = {
    partyPokemon: PartyPokemon;
    matchupResult: DefensiveMatchupResult;
};

type DefensiveMatchupSectionProps = {
    opponentPokemonCount: number;
    currentPokemonCount: number;
    defensiveMatchupResults: DefensiveMatchupResultItem[];
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

export const DefensiveMatchupSection = ({
    opponentPokemonCount,
    currentPokemonCount,
    defensiveMatchupResults,
    pokemonList,
}: DefensiveMatchupSectionProps) => {
    return (
        <section className="mt-8 rounded border p-6">
            <h2 className="text-xl font-bold">自分側の防御相性</h2>

            <p className="mt-1 text-sm text-gray-600">
                相手ポケモンのタイプ一致技を想定し、自分側の受けやすさを簡易採点します。
            </p>

            <p className="mt-1 text-xs text-gray-500">
                実際の技構成や特性は未反映です。相手のタイプから推定しています。
            </p>

            {opponentPokemonCount === 0 ? (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    相手ポケモンを入力すると、防御相性点が表示されます。
                </p>
            ) : currentPokemonCount === 0 ? (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    自分のパーティにポケモンを登録してください。
                </p>
            ) : (
                <div className="mt-4 space-y-4">
                    {defensiveMatchupResults.map(
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
                                                    半減以下：
                                                    {
                                                        matchupResult.resistTargetCount
                                                    }
                                                    匹 / 弱点：
                                                    {
                                                        matchupResult.weakTargetCount
                                                    }
                                                    匹
                                                </p>
                                            </div>
                                        </div>

                                        <span className="rounded bg-white px-3 py-1 text-sm font-semibold">
                                            防御相性点 {matchupResult.score}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {matchupResult.targets.map((target) => (
                                            <span
                                                key={`${partyPokemon.id}-${target.opponentKey}-${target.opponentFormKey}`}
                                                className={`rounded px-2 py-1 text-xs ${
                                                    target.worstMultiplier > 1
                                                        ? "bg-red-100 text-red-700"
                                                        : target.worstMultiplier <
                                                            1
                                                          ? "bg-green-100 text-green-700"
                                                          : "bg-white text-gray-700"
                                                }`}
                                            >
                                                {target.opponentName}：{" "}
                                                {target.worstAttackType
                                                    ? `${target.worstAttackType} ×${target.worstMultiplier}`
                                                    : "判定なし"}
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
