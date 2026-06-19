import { isMegaForm } from "@/features/battlePreview/utils/megaEvolution";
import { PokemonSearchSelector } from "@/features/partyPokemon/components/PokemonSearchSelector";
import { isPokemonAvailableForRule } from "@/features/pokemonRules/isPokemonAvailableForRule";
import type { PartyRule } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type PartyPokemonSearchSectionProps = {
    pokemonList: Pokemon[];
    partyRule: PartyRule;
    selectedPokemonKey: string;
    selectedFormKey: string;
    searchKeyword: string;
    selectedTypes: string[];
    onChangeSearchKeyword: (keyword: string) => void;
    onChangeSelectedTypes: (types: string[]) => void;
    isPokemonRegistered: (pokemon: Pokemon) => boolean;
    onSelectPokemon: (pokemon: Pokemon) => void;
};

export const PartyPokemonSearchSection = ({
    pokemonList,
    partyRule,
    selectedPokemonKey,
    selectedFormKey,
    searchKeyword,
    selectedTypes,
    onChangeSearchKeyword,
    onChangeSelectedTypes,
    isPokemonRegistered,
    onSelectPokemon,
}: PartyPokemonSearchSectionProps) => {
    const isSelectedPokemon = (pokemon: Pokemon) => {
        return (
            pokemon.key === selectedPokemonKey &&
            pokemon.form_key === selectedFormKey
        );
    };

    return (
        <section className="rounded border bg-white p-5">
            <h2 className="text-lg font-bold">ポケモン選択</h2>

            <p className="mt-1 text-sm text-gray-600">
                名前・かな・タイプから登録するポケモンを探せます。
            </p>

            <div className="mt-4">
                <PokemonSearchSelector
                    pokemonList={pokemonList}
                    searchKeyword={searchKeyword}
                    onChangeSearchKeyword={onChangeSearchKeyword}
                    selectedTypes={selectedTypes}
                    onChangeSelectedTypes={onChangeSelectedTypes}
                    filterPokemon={(pokemon) =>
                        !isMegaForm(pokemon) &&
                        isPokemonAvailableForRule(pokemon, partyRule)
                    }
                    isPokemonSelected={isSelectedPokemon}
                    isPokemonDisabled={isPokemonRegistered}
                    getPokemonStatusLabel={(pokemon) => {
                        if (isPokemonRegistered(pokemon)) {
                            return "登録済み";
                        }

                        if (isSelectedPokemon(pokemon)) {
                            return "選択中";
                        }

                        return null;
                    }}
                    onSelectPokemon={(pokemon) => {
                        if (isPokemonRegistered(pokemon)) {
                            return;
                        }

                        onSelectPokemon(pokemon);
                    }}
                />
            </div>
        </section>
    );
};
