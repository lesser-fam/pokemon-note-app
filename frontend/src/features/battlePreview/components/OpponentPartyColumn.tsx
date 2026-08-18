import { BattlePokemonCard } from "@/features/battlePreview/components/BattlePokemonCard";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonAbilityGroup } from "@/types/pokemonAbility";
import { AbilityTooltip } from "./AbilityTooltip";
import { MegaFormToggle } from "./MegaFormToggle";
import type { PokemonStatKey } from "./PokemonStatLabels";

type OpponentAbility = PokemonAbilityGroup["abilities"][number];
const opponentSelectionLimit = 3;

type OpponentSelectionButtonProps = {
    pokemon: Pokemon;
    selectedOpponentPokemonKeys: string[];
    onToggle: (pokemon: Pokemon) => void;
};

const OpponentSelectionButton = ({
    pokemon,
    selectedOpponentPokemonKeys,
    onToggle,
}: OpponentSelectionButtonProps) => {
    const pokemonIdentifier = `${pokemon.key}:${pokemon.form_key}`;
    const selectionIndex =
        selectedOpponentPokemonKeys.indexOf(pokemonIdentifier);
    const isSelected = selectionIndex >= 0;
    const isDisabled =
        !isSelected &&
        selectedOpponentPokemonKeys.length >= opponentSelectionLimit;

    return (
        <button
            type="button"
            onClick={() => onToggle(pokemon)}
            disabled={isDisabled}
            aria-pressed={isSelected}
            title={isDisabled ? "相手選出は3匹までです" : undefined}
            className={`min-h-7 whitespace-nowrap rounded border px-2 py-1 text-xs font-semibold leading-none transition-colors ${
                isSelected
                    ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            }`}
        >
            {isSelected ? `選出中 ${selectionIndex + 1}` : "選出"}
        </button>
    );
};

type OpponentPartyColumnProps = {
    opponentPokemonList: Pokemon[];
    pokemonList: Pokemon[];
    highlightedStats?: PokemonStatKey[];
    getPokemonAbilities: (pokemon: Pokemon) => OpponentAbility[];
    onRemove: (pokemon: Pokemon) => void;
    onChangeForm: (currentPokemon: Pokemon, nextPokemon: Pokemon) => void;
    actionTargetPokemonKey?: string | null;
    onSelectActionTarget?: (pokemon: Pokemon) => void;
    selectedOpponentPokemonKeys?: string[];
    onToggleOpponentSelection?: (pokemon: Pokemon) => void;
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
    selectedOpponentPokemonKeys = [],
    onToggleOpponentSelection,
}: OpponentPartyColumnProps) {
    return (
        <aside className="rounded border bg-white p-3">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">相手パーティ</h2>

                <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">
                        {opponentPokemonList.length} / 6
                    </p>

                    {onToggleOpponentSelection && (
                        <p className="text-[11px] font-medium text-blue-700">
                            実選出 {selectedOpponentPokemonKeys.length} / 3
                        </p>
                    )}
                </div>
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
                                    <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-start">
                                        <MegaFormToggle
                                            pokemon={pokemon}
                                            pokemonList={pokemonList}
                                            onChange={(nextPokemon) =>
                                                onChangeForm(
                                                    pokemon,
                                                    nextPokemon,
                                                )
                                            }
                                        />

                                        {onToggleOpponentSelection && (
                                            <OpponentSelectionButton
                                                pokemon={pokemon}
                                                selectedOpponentPokemonKeys={
                                                    selectedOpponentPokemonKeys
                                                }
                                                onToggle={
                                                    onToggleOpponentSelection
                                                }
                                            />
                                        )}
                                    </div>
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
