import {
    suggestNextBattleActions,
    type SuggestedBattleAction,
} from "@/features/battlePreview/utils/suggestNextBattleActions";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonCommonMove } from "@/types/pokemonCommonMove";

type NextBattleActionSuggestionsProps = {
    ownPartyPokemon: PartyPokemon | null;
    ownPokemonMaster: Pokemon | null;
    opponentPokemon: Pokemon | null;
    partyPokemonList: PartyPokemon[];
    pokemonMasterList: Pokemon[];
    selectedPartyPokemonIds: number[];
    pokemonCommonMoves: PokemonCommonMove[];
};

const getActionLabel = (action: SuggestedBattleAction) => {
    return action.label;
};

export function NextBattleActionSuggestions({
    ownPartyPokemon,
    ownPokemonMaster,
    opponentPokemon,
    partyPokemonList,
    pokemonMasterList,
    selectedPartyPokemonIds,
    pokemonCommonMoves,
}: NextBattleActionSuggestionsProps) {
    if (!ownPartyPokemon || !ownPokemonMaster || !opponentPokemon) {
        return (
            <section className="rounded border bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-bold">
                        次どうする？おすすめ選択肢
                    </h2>

                    <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500">
                        β
                    </span>
                </div>

                <p className="mt-3 text-sm text-gray-600">
                    自分のポケモン1匹と相手のポケモン1匹を選ぶと、技4つ＋選出中の控えへの交代からおすすめ行動を2つ表示します。
                </p>
            </section>
        );
    }

    const suggestions = suggestNextBattleActions({
        ownPartyPokemon,
        ownPokemonMaster,
        opponentPokemon,
        partyPokemonList,
        pokemonMasterList,
        selectedPartyPokemonIds,
        pokemonCommonMoves,
    });

    return (
        <section className="rounded border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">
                    次どうする？おすすめ選択肢
                </h2>

                <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500">
                    β
                </span>
            </div>

            <div className="mt-3 rounded bg-gray-50 p-3 text-xs text-gray-600">
                <p>
                    選択中：
                    <span className="font-semibold text-gray-800">
                        {ownPartyPokemon.nickname ||
                            ownPokemonMaster.name ||
                            ownPartyPokemon.pokemon_key}
                    </span>
                    {" vs "}
                    <span className="font-semibold text-gray-800">
                        {opponentPokemon.name}
                    </span>
                </p>

                <p className="mt-1">
                    ※
                    正確なダメージ計算ではなく、タイプ相性・技分類・種族値・努力値・素早さからの簡易評価です。
                </p>
            </div>

            <div className="mt-3 space-y-2">
                {suggestions.map((suggestion, index) => (
                    <div
                        key={`${suggestion.kind}-${suggestion.label}`}
                        className="rounded border bg-gray-50 p-3"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold">
                                おすすめ{index + 1}：
                                {getActionLabel(suggestion)}
                            </p>

                            <span className="rounded bg-white px-2 py-1 text-[10px] font-semibold text-gray-500">
                                評価 {suggestion.score}
                            </span>
                        </div>

                        <ul className="mt-2 space-y-1 text-xs text-gray-700">
                            {suggestion.reasonList.map((reason) => (
                                <li key={reason}>・{reason}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
