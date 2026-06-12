import { RegisteredPartyPokemonCard } from "@/features/parties/components/RegisteredPartyPokemonCard";
import type { PartyVersion } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type PartyVersionHistoryProps = {
    versions: PartyVersion[];
    findPokemonMaster: (
        pokemonKey: string,
        formKey: string,
    ) => Pokemon | undefined;
};

export function PartyVersionHistory({
    versions,
    findPokemonMaster,
}: PartyVersionHistoryProps) {
    const sortedVersions = [...versions].sort(
        (a, b) => b.version_number - a.version_number,
    );

    return (
        <section className="mt-8 rounded border p-6">
            <h2 className="text-xl font-bold">バージョン履歴</h2>

            <p className="mt-1 text-sm text-gray-600">
                過去の構築と変更内容を確認できます。
            </p>

            {sortedVersions.length === 0 ? (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    バージョン履歴がありません。
                </p>
            ) : (
                <div className="mt-4 max-h-180 space-y-3 overflow-y-auto pr-1">
                    {sortedVersions.map((version) => {
                        const pokemonList = version.pokemon ?? [];

                        return (
                            <details
                                key={version.id}
                                className="rounded border bg-gray-50"
                            >
                                <summary className="cursor-pointer list-none p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold">
                                                    v{version.version_number}
                                                </span>

                                                {version.is_current && (
                                                    <span className="rounded-full bg-black px-2 py-0.5 text-[10px] text-white">
                                                        現在
                                                    </span>
                                                )}

                                                <span className="text-xs text-gray-400">
                                                    {pokemonList.length} / 6
                                                </span>
                                            </div>

                                            {version.change_note && (
                                                <p className="mt-1 max-w-3xl truncate text-sm text-gray-600">
                                                    {version.change_note}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-wrap gap-1">
                                                {pokemonList.map(
                                                    (partyPokemon) => {
                                                        const pokemonMaster =
                                                            findPokemonMaster(
                                                                partyPokemon.pokemon_key,
                                                                partyPokemon.form_key,
                                                            );

                                                        return pokemonMaster?.image_url ? (
                                                            <img
                                                                key={
                                                                    partyPokemon.id
                                                                }
                                                                src={
                                                                    pokemonMaster.image_url
                                                                }
                                                                alt={
                                                                    pokemonMaster.name
                                                                }
                                                                title={
                                                                    partyPokemon.nickname ||
                                                                    pokemonMaster.name
                                                                }
                                                                className="h-9 w-9 rounded bg-white object-contain"
                                                            />
                                                        ) : (
                                                            <div
                                                                key={
                                                                    partyPokemon.id
                                                                }
                                                                title={
                                                                    partyPokemon.nickname ||
                                                                    partyPokemon.pokemon_key
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded bg-white text-xs text-gray-400"
                                                            >
                                                                ?
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            <span className="text-xs text-blue-600">
                                                開閉する
                                            </span>
                                        </div>
                                    </div>
                                </summary>

                                <div className="border-t bg-white p-4">
                                    {pokemonList.length > 0 ? (
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                            {pokemonList.map((partyPokemon) => (
                                                <RegisteredPartyPokemonCard
                                                    key={partyPokemon.id}
                                                    partyPokemon={partyPokemon}
                                                    pokemonMaster={findPokemonMaster(
                                                        partyPokemon.pokemon_key,
                                                        partyPokemon.form_key,
                                                    )}
                                                    canRemove={false}
                                                    isRemoving={false}
                                                    onRemove={() => {}}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600">
                                            このバージョンにはポケモンが登録されていません。
                                        </p>
                                    )}
                                </div>
                            </details>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
