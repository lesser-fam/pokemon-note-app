import { RegisteredPartyPokemonCard } from "@/features/parties/components/RegisteredPartyPokemonCard";
import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";

type RegisteredPartyPokemonSectionProps = {
    partyId: number;
    currentPokemonList: PartyPokemon[];
    pokemonList: Pokemon[];
    partyPokemonLimit: number;
    canRemoveInitialPokemon: boolean;
    deletingPartyPokemonId: number | null;
    onRemoveInitialPokemon: (partyPokemonId: number) => void;
};

export const RegisteredPartyPokemonSection = ({
    partyId,
    currentPokemonList,
    pokemonList,
    partyPokemonLimit,
    canRemoveInitialPokemon,
    deletingPartyPokemonId,
    onRemoveInitialPokemon,
}: RegisteredPartyPokemonSectionProps) => {
    return (
        <section className="mt-8 rounded border p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">登録ポケモン</h2>

                {currentPokemonList.length < partyPokemonLimit ? (
                    <Link
                        href={`/parties/${partyId}/pokemon/create`}
                        className="rounded bg-black px-4 py-2 text-white"
                    >
                        ポケモンを追加
                    </Link>
                ) : (
                    <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded bg-gray-300 px-4 py-2 text-white"
                    >
                        {partyPokemonLimit}匹登録済み
                    </button>
                )}
            </div>

            {currentPokemonList.length >= partyPokemonLimit && (
                <p className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
                    {partyPokemonLimit}
                    匹そろっているため、この画面からは追加できません。変更する場合は「新バージョン作成」から入れ替えてください。
                </p>
            )}

            {canRemoveInitialPokemon && (
                <p className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
                    初回登録中は、間違えて追加したポケモンを「外す」ことができます。
                    {partyPokemonLimit}
                    匹そろった後の変更は「新バージョン作成」から行います。
                </p>
            )}

            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {currentPokemonList.length > 0 ? (
                    currentPokemonList.map((pokemon) => {
                        const pokemonMaster = findPokemonMaster({
                            pokemonList,
                            pokemonKey: pokemon.pokemon_key,
                            formKey: pokemon.form_key,
                        });

                        return (
                            <RegisteredPartyPokemonCard
                                key={pokemon.id}
                                partyPokemon={pokemon}
                                pokemonMaster={pokemonMaster}
                                canRemove={canRemoveInitialPokemon}
                                isRemoving={
                                    deletingPartyPokemonId === pokemon.id
                                }
                                onRemove={() =>
                                    onRemoveInitialPokemon(pokemon.id)
                                }
                            />
                        );
                    })
                ) : (
                    <p className="text-gray-600">
                        まだポケモンが登録されていません。
                    </p>
                )}
            </div>
        </section>
    );
};
