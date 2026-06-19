import { isMegaForm } from "@/features/battlePreview/utils/megaEvolution";
import { PokemonSearchSelector } from "@/features/partyPokemon/components/PokemonSearchSelector";
import { isPokemonAvailableForRule } from "@/features/pokemonRules/isPokemonAvailableForRule";
import type { PartyRule } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { RefObject } from "react";

type EditablePokemonSearchSectionProps = {
    sectionRef: RefObject<HTMLDivElement | null>;
    replaceTargetIndex: number | null;
    editablePokemonCount: number;
    partyPokemonLimit: number;
    partyRule: PartyRule;
    pokemonList: Pokemon[];
    searchKeyword: string;
    selectedTypes: string[];
    onChangeSearchKeyword: (keyword: string) => void;
    onChangeSelectedTypes: (types: string[]) => void;
    onCancelReplacingPokemon: () => void;
    isPokemonDisabled: (pokemon: Pokemon) => boolean;
    onSelectPokemon: (pokemon: Pokemon) => void;
};

export const EditablePokemonSearchSection = ({
    sectionRef,
    replaceTargetIndex,
    editablePokemonCount,
    partyPokemonLimit,
    partyRule,
    pokemonList,
    searchKeyword,
    selectedTypes,
    onChangeSearchKeyword,
    onChangeSelectedTypes,
    onCancelReplacingPokemon,
    isPokemonDisabled,
    onSelectPokemon,
}: EditablePokemonSearchSectionProps) => {
    const isPartyFull =
        replaceTargetIndex === null &&
        editablePokemonCount >= partyPokemonLimit;

    return (
        <div
            ref={sectionRef}
            className="mt-8 scroll-mt-4 rounded bg-gray-50 p-4"
        >
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold">
                        {replaceTargetIndex === null
                            ? "ポケモンを追加"
                            : `${replaceTargetIndex + 1}匹目を入れ替え`}
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                        {replaceTargetIndex === null
                            ? `${partyPokemonLimit}匹未満の場合、ここからポケモンを追加できます。`
                            : "選んだポケモンでこの枠を入れ替えます。"}
                    </p>
                </div>

                {replaceTargetIndex !== null && (
                    <button
                        type="button"
                        onClick={onCancelReplacingPokemon}
                        className="text-sm text-blue-600"
                    >
                        入れ替えをやめる
                    </button>
                )}
            </div>

            {isPartyFull ? (
                <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                    すでに{partyPokemonLimit}
                    匹そろっています。入れ替えたいポケモンを選択し、
                    「入れ替え」ボタンを押してください。
                </p>
            ) : (
                <div className="mt-4">
                    <PokemonSearchSelector
                        pokemonList={pokemonList}
                        searchKeyword={searchKeyword}
                        onChangeSearchKeyword={onChangeSearchKeyword}
                        clearSearchKeywordOnSelect
                        selectedTypes={selectedTypes}
                        onChangeSelectedTypes={onChangeSelectedTypes}
                        filterPokemon={(pokemon) =>
                            !isMegaForm(pokemon) &&
                            isPokemonAvailableForRule(pokemon, partyRule)
                        }
                        isPokemonDisabled={isPokemonDisabled}
                        getPokemonStatusLabel={(pokemon) =>
                            isPokemonDisabled(pokemon) ? "選択済み" : null
                        }
                        onSelectPokemon={(pokemon) => {
                            if (isPokemonDisabled(pokemon)) {
                                return;
                            }

                            onSelectPokemon(pokemon);
                        }}
                    />
                </div>
            )}
        </div>
    );
};
