import { PokemonSearchSelector } from "@/features/partyPokemon/components/PokemonSearchSelector";
import { isPokemonAvailableForRule } from "@/features/pokemonRules/isPokemonAvailableForRule";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type OpponentPokemonSearchSectionProps = {
    partyRule: Party["rule"];
    pokemonList: Pokemon[];
    opponentPokemonList: Pokemon[];
    partyPokemonLimit: number;
    searchKeyword: string;
    selectedTypes: string[];
    onChangeSearchKeyword: (keyword: string) => void;
    onChangeSelectedTypes: (types: string[]) => void;
    onSelectPokemon: (pokemon: Pokemon) => void;
};

export const OpponentPokemonSearchSection = ({
    partyRule,
    pokemonList,
    opponentPokemonList,
    partyPokemonLimit,
    searchKeyword,
    selectedTypes,
    onChangeSearchKeyword,
    onChangeSelectedTypes,
    onSelectPokemon,
}: OpponentPokemonSearchSectionProps) => {
    const isOpponentPokemonSelected = (pokemon: Pokemon) => {
        return opponentPokemonList.some(
            (selectedPokemon) => selectedPokemon.key === pokemon.key,
        );
    };

    const isOpponentPokemonDisabled = (pokemon: Pokemon) => {
        return (
            opponentPokemonList.length >= partyPokemonLimit ||
            isOpponentPokemonSelected(pokemon)
        );
    };

    return (
        <section className="rounded border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">相手ポケモンを探す</h2>

                    <p className="mt-1 text-xs text-gray-500">
                        相手パーティへ追加するポケモンを選択してください。
                    </p>
                </div>

                <p className="text-sm font-medium text-gray-600">
                    {opponentPokemonList.length} / {partyPokemonLimit}
                </p>
            </div>

            <div className="mt-4">
                <PokemonSearchSelector
                    layout="compact"
                    pokemonList={pokemonList}
                    searchKeyword={searchKeyword}
                    onChangeSearchKeyword={onChangeSearchKeyword}
                    clearSearchKeywordOnSelect
                    selectedTypes={selectedTypes}
                    onChangeSelectedTypes={onChangeSelectedTypes}
                    isPokemonSelected={isOpponentPokemonSelected}
                    isPokemonDisabled={isOpponentPokemonDisabled}
                    getPokemonStatusLabel={(pokemon) =>
                        isOpponentPokemonSelected(pokemon) ? "選択済み" : null
                    }
                    onSelectPokemon={onSelectPokemon}
                    filterPokemon={(pokemon) =>
                        isPokemonAvailableForRule(pokemon, partyRule)
                    }
                />
            </div>
        </section>
    );
};
