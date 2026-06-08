import { BattlePokemonCard } from "@/features/battlePreview/components/BattlePokemonCard";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonAbilityWarning } from "@/types/pokemonAbilityWarning";
import type { PokemonStatKey } from "./PokemonStatLabels";

type OpponentAbility = PokemonAbilityWarning["abilities"][number];

type OpponentPartyColumnProps = {
    opponentPokemonList: Pokemon[];
    highlightedStats?: PokemonStatKey[];
    getPokemonAbilities: (pokemon: Pokemon) => OpponentAbility[];
    onRemove: (pokemon: Pokemon) => void;
};

export function OpponentPartyColumn({
    opponentPokemonList,
    highlightedStats = [],
    getPokemonAbilities,
    onRemove,
}: OpponentPartyColumnProps) {
    return (
        <aside className="rounded border bg-white p-3">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">相手パーティ</h2>

                <p className="text-sm font-medium text-gray-600">
                    {opponentPokemonList.length} / 6
                </p>
            </div>

            {opponentPokemonList.length === 0 ? (
                <p className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-600">
                    中央の検索欄から相手ポケモンを追加してください。
                </p>
            ) : (
                <div className="mt-2 space-y-1.5">
                    {opponentPokemonList.map((pokemon) => {
                        const abilities = getPokemonAbilities(pokemon);

                        return (
                            <BattlePokemonCard
                                key={`${pokemon.key}-${pokemon.form_key}`}
                                pokemon={pokemon}
                                highlightedStats={highlightedStats}
                                imageAction={
                                    <button
                                        type="button"
                                        onClick={() => onRemove(pokemon)}
                                        className="w-full rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                    >
                                        削除
                                    </button>
                                }
                                footer={
                                    abilities.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {abilities.map((ability) => (
                                                <span
                                                    key={ability.id}
                                                    className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-800"
                                                >
                                                    {ability.name}
                                                    {ability.is_hidden && "※"}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-gray-400">
                                            特性データなし
                                        </span>
                                    )
                                }
                            />
                        );
                    })}
                </div>
            )}
        </aside>
    );
}
