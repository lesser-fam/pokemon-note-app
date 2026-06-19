import { MatchupSuggestionPokemonCard } from "@/features/battlePreview/components/MatchupSuggestionPokemonCard";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type MatchupSelectionSuggestion = {
    totalScore: number;
    leadPokemon: PartyPokemon;
    switchPokemon: PartyPokemon;
    finisherPokemon: PartyPokemon;
    leadBreakdown: {
        roleTagScore: number;
        offensiveScore: number;
        defensiveScore: number;
        speedScore: number;
        battleLogScore: number;
    };
    switchBreakdown: {
        roleTagScore: number;
        offensiveScore: number;
        defensiveScore: number;
        battleLogScore: number;
    };
    finisherBreakdown: {
        roleTagScore: number;
        offensiveScore: number;
        defensiveScore: number;
        speedScore: number;
        battleLogScore: number;
    };
    savedTemplateBonus: number;
    reasons: string[];
};

type MatchupSelectionSuggestionsSectionProps = {
    opponentPokemonCount: number;
    currentPokemonCount: number;
    selectionPokemonLimit: number;
    matchupSelectionSuggestions: MatchupSelectionSuggestion[];
    pokemonList: Pokemon[];
    onSelectSuggestion: (partyPokemonIds: number[]) => void;
};

export const MatchupSelectionSuggestionsSection = ({
    opponentPokemonCount,
    currentPokemonCount,
    selectionPokemonLimit,
    matchupSelectionSuggestions,
    pokemonList,
    onSelectSuggestion,
}: MatchupSelectionSuggestionsSectionProps) => {
    return (
        <section className="rounded border bg-white p-3">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">おすすめ選出β</h2>

                <span className="text-[10px] text-gray-400">
                    相手の型は未確定
                </span>
            </div>

            <p className="mt-1 text-[11px] text-gray-500">
                攻撃相性、防御相性、特性、持ち物、役割、素早さ、保存済み基本選出、過去ログから簡易採点しています。
            </p>

            {opponentPokemonCount === 0 ? (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    相手ポケモンを入力すると、おすすめ選出が表示されます。
                </p>
            ) : currentPokemonCount < selectionPokemonLimit ? (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    おすすめ選出を表示するには、自分のポケモンを
                    {selectionPokemonLimit}
                    匹以上登録してください。
                </p>
            ) : (
                <div className="mt-2 space-y-2">
                    {matchupSelectionSuggestions.map((suggestion, index) => (
                        <div
                            key={`${suggestion.leadPokemon.id}-${suggestion.switchPokemon.id}-${suggestion.finisherPokemon.id}`}
                            className="rounded border bg-gray-50 p-2"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold">
                                        {index + 1}位
                                    </h3>

                                    <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold">
                                        {suggestion.totalScore}点
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onSelectSuggestion([
                                            suggestion.leadPokemon.id,
                                            suggestion.switchPokemon.id,
                                            suggestion.finisherPokemon.id,
                                        ])
                                    }
                                    className="rounded bg-black px-2 py-1 text-xs text-white hover:bg-gray-800"
                                >
                                    これにする
                                </button>
                            </div>

                            <div className="mt-2 grid grid-cols-3 gap-1.5">
                                <MatchupSuggestionPokemonCard
                                    label="初手"
                                    partyPokemon={suggestion.leadPokemon}
                                    pokemonList={pokemonList}
                                />

                                <MatchupSuggestionPokemonCard
                                    label="引き先"
                                    partyPokemon={suggestion.switchPokemon}
                                    pokemonList={pokemonList}
                                />

                                <MatchupSuggestionPokemonCard
                                    label="勝ち筋"
                                    partyPokemon={suggestion.finisherPokemon}
                                    pokemonList={pokemonList}
                                />
                            </div>

                            <details className="mt-1.5">
                                <summary className="cursor-pointer text-[11px] text-blue-600">
                                    点数の内訳を見る
                                </summary>

                                <div className="mt-2 grid gap-1.5 text-[10px] text-gray-600 md:grid-cols-3">
                                    <div className="rounded bg-white p-2">
                                        <p className="font-semibold">初手</p>

                                        <p className="mt-1">
                                            役割タグ{" "}
                                            {
                                                suggestion.leadBreakdown
                                                    .roleTagScore
                                            }{" "}
                                            / 攻撃{" "}
                                            {
                                                suggestion.leadBreakdown
                                                    .offensiveScore
                                            }{" "}
                                            / 防御{" "}
                                            {
                                                suggestion.leadBreakdown
                                                    .defensiveScore
                                            }{" "}
                                            / 素早さ{" "}
                                            {
                                                suggestion.leadBreakdown
                                                    .speedScore
                                            }{" "}
                                            / 過去ログ{" "}
                                            {
                                                suggestion.leadBreakdown
                                                    .battleLogScore
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded bg-white p-2">
                                        <p className="font-semibold">引き先</p>

                                        <p className="mt-1">
                                            役割タグ{" "}
                                            {
                                                suggestion.switchBreakdown
                                                    .roleTagScore
                                            }{" "}
                                            / 攻撃{" "}
                                            {
                                                suggestion.switchBreakdown
                                                    .offensiveScore
                                            }{" "}
                                            / 防御{" "}
                                            {
                                                suggestion.switchBreakdown
                                                    .defensiveScore
                                            }{" "}
                                            / 過去ログ{" "}
                                            {
                                                suggestion.switchBreakdown
                                                    .battleLogScore
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded bg-white p-2">
                                        <p className="font-semibold">勝ち筋</p>

                                        <p className="mt-1">
                                            役割タグ{" "}
                                            {
                                                suggestion.finisherBreakdown
                                                    .roleTagScore
                                            }{" "}
                                            / 攻撃{" "}
                                            {
                                                suggestion.finisherBreakdown
                                                    .offensiveScore
                                            }{" "}
                                            / 防御{" "}
                                            {
                                                suggestion.finisherBreakdown
                                                    .defensiveScore
                                            }{" "}
                                            / 素早さ{" "}
                                            {
                                                suggestion.finisherBreakdown
                                                    .speedScore
                                            }{" "}
                                            / 過去ログ{" "}
                                            {
                                                suggestion.finisherBreakdown
                                                    .battleLogScore
                                            }
                                        </p>
                                    </div>
                                </div>

                                {suggestion.savedTemplateBonus > 0 && (
                                    <p className="mt-2 text-[10px] font-medium text-blue-700">
                                        保存済み基本選出との一致：+
                                        {suggestion.savedTemplateBonus}点
                                    </p>
                                )}

                                {suggestion.reasons.length > 0 && (
                                    <ul className="mt-2 space-y-0.5 text-[10px] text-gray-600">
                                        {suggestion.reasons.map((reason) => (
                                            <li key={reason}>・{reason}</li>
                                        ))}
                                    </ul>
                                )}
                            </details>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
