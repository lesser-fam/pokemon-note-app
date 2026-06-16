import { BattlePokemonCard } from "@/features/battlePreview/components/BattlePokemonCard";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonAbilityWarning } from "@/types/pokemonAbilityWarning";
import { AbilityTooltip } from "./AbilityTooltip";
import { MegaFormToggle } from "./MegaFormToggle";
import type { PokemonStatKey } from "./PokemonStatLabels";

type OpponentAbility = PokemonAbilityWarning["abilities"][number];

type OpponentPartyColumnProps = {
    opponentPokemonList: Pokemon[];
    pokemonList: Pokemon[];
    highlightedStats?: PokemonStatKey[];
    getPokemonAbilities: (pokemon: Pokemon) => OpponentAbility[];
    onRemove: (pokemon: Pokemon) => void;
    onChangeForm: (currentPokemon: Pokemon, nextPokemon: Pokemon) => void;
    actionTargetPokemonKey?: string | null;
    onSelectActionTarget?: (pokemon: Pokemon) => void;
};

export function OpponentPartyColumn({
    opponentPokemonList,
    pokemonList,
    highlightedStats = [],
    getPokemonAbilities,
    onRemove,
    onChangeForm,
    actionTargetPokemonKey = null,
    onSelectActionTarget,
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
                        const pokemonIdentifier = `${pokemon.key}:${pokemon.form_key}`;
                        const isActionTarget =
                            actionTargetPokemonKey === pokemon.key;

                        return (
                            <BattlePokemonCard
                                key={pokemonIdentifier}
                                pokemon={pokemon}
                                highlightedStats={highlightedStats}
                                headerAction={
                                    <MegaFormToggle
                                        pokemon={pokemon}
                                        pokemonList={pokemonList}
                                        onChange={(nextPokemon) =>
                                            onChangeForm(pokemon, nextPokemon)
                                        }
                                    />
                                }
                                imageAction={
                                    <button
                                        type="button"
                                        onClick={() => onRemove(pokemon)}
                                        className="flex h-4 w-full items-center justify-center whitespace-nowrap rounded border border-red-200 px-0.5 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        外す
                                    </button>
                                }
                                footer={
                                    <div className="flex w-full items-center gap-1">
                                        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                                            {abilities.length > 0 ? (
                                                abilities.map((ability) => (
                                                    <AbilityTooltip
                                                        key={ability.id}
                                                        name={ability.name}
                                                        description={
                                                            ability.description
                                                        }
                                                        isHidden={
                                                            ability.is_hidden
                                                        }
                                                    />
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-400">
                                                    特性データなし
                                                </span>
                                            )}
                                        </div>

                                        {onSelectActionTarget && (
                                            <div className="ml-auto shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onSelectActionTarget(
                                                            pokemon,
                                                        )
                                                    }
                                                    className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                                                        isActionTarget
                                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                                            : "text-gray-600 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {isActionTarget
                                                        ? "提案中"
                                                        : "提案"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        );
                    })}
                </div>
            )}
        </aside>
    );
}
