import type { PartyPokemon } from "@/types/party";
import { SelectionPokemonCard } from "./SelectionPokemonCard";
import type { Pokemon } from "@/types/pokemon";

type SuggestedSelectionItem = {
    role: string;
    label: string;
    pokemon?: PartyPokemon | null;
    reason: string;
    score: number;
};

type SuggestedSelectionSectionProps = {
    suggestedSelection: SuggestedSelectionItem[];
    currentPokemonCount: number;
    selectionPokemonLimit: number;
    isSavingSelection: boolean;
    onSaveSuggestedSelection: () => void;
    pokemonList: Pokemon[];
};

export const SuggestedSelectionSection = ({
    suggestedSelection,
    currentPokemonCount,
    selectionPokemonLimit,
    isSavingSelection,
    onSaveSuggestedSelection,
    pokemonList,
}: SuggestedSelectionSectionProps) => {
    return (
        <div className="rounded border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">おすすめ基本選出</h2>

                    <div className="mt-1 space-y-1 text-xs leading-relaxed text-gray-600">
                        <p>
                            基本選出は、選出に迷ったときの出発点となる3匹です。
                        </p>
                        <p>
                            設定した役割タグをもとに、初手・引き先・勝ち筋の候補を仮提案します。
                        </p>
                        <p>
                            まずはこの3匹を基準にしながら、相手に応じて自分で選出を考えてみましょう。
                        </p>
                    </div>
                </div>

                {currentPokemonCount >= selectionPokemonLimit && (
                    <button
                        type="button"
                        onClick={onSaveSuggestedSelection}
                        disabled={isSavingSelection}
                        className="rounded bg-black px-3 py-2 text-xs text-white disabled:opacity-50"
                    >
                        {isSavingSelection ? "保存中..." : "この選出を保存"}
                    </button>
                )}
            </div>

            <p className="mt-3 rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
                保存すると、このバージョンの基本形として残り、対戦前のおすすめ候補を考える際の参考情報として利用されます。保存しても、この3匹が自動的に最終選出されるわけではありません。
            </p>

            {currentPokemonCount < selectionPokemonLimit ? (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    基本選出を提案するには、ポケモンを
                    {selectionPokemonLimit}
                    匹以上登録してください。
                </p>
            ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {suggestedSelection.map((suggestion) => (
                        <div key={suggestion.role}>
                            <SelectionPokemonCard
                                label={suggestion.label}
                                partyPokemon={suggestion.pokemon}
                                pokemonList={pokemonList}
                            />

                            <p className="mt-2 text-xs text-gray-600">
                                {suggestion.reason}
                            </p>

                            <p className="mt-1 text-[11px] text-gray-400">
                                点数：
                                {suggestion.score}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
