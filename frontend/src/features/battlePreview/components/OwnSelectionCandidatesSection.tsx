import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import type { Party, PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type SelectionTemplate = NonNullable<
    NonNullable<Party["current_version"]>["selection_templates"]
>[number];

type SuggestedSelectionItem = {
    role: string;
    label: string;
    pokemon?: PartyPokemon | null;
    reason: string;
    score: number;
};

type OwnSelectionCandidatesSectionProps = {
    savedSelectionTemplates: SelectionTemplate[];
    suggestedSelection: SuggestedSelectionItem[];
    currentPokemonCount: number;
    selectionPokemonLimit: number;
    pokemonList: Pokemon[];
};

const getPartyPokemonDisplayName = (
    partyPokemon: PartyPokemon | null | undefined,
    pokemonList: Pokemon[],
) => {
    if (!partyPokemon) {
        return "未設定";
    }

    const pokemonMaster = findPokemonMaster({
        pokemonList,
        pokemonKey: partyPokemon.pokemon_key,
        formKey: partyPokemon.form_key,
    });

    return (
        partyPokemon.nickname || pokemonMaster?.name || partyPokemon.pokemon_key
    );
};

export const OwnSelectionCandidatesSection = ({
    savedSelectionTemplates,
    suggestedSelection,
    currentPokemonCount,
    selectionPokemonLimit,
    pokemonList,
}: OwnSelectionCandidatesSectionProps) => {
    return (
        <section className="mt-8 rounded border p-6">
            <h2 className="text-xl font-bold">自分側の選出候補</h2>

            <p className="mt-1 text-sm text-gray-600">
                保存済み基本選出と、役割タグからの自動提案を見ながら選出を考えます。
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded bg-gray-50 p-4">
                    <h3 className="font-bold">保存済み基本選出</h3>

                    {savedSelectionTemplates.length > 0 ? (
                        <div className="mt-4 space-y-4">
                            {savedSelectionTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="rounded bg-white p-4"
                                >
                                    <p className="font-semibold">
                                        {template.name}
                                    </p>

                                    {template.memo && (
                                        <p className="mt-1 text-sm text-gray-600">
                                            {template.memo}
                                        </p>
                                    )}

                                    <div className="mt-3 grid gap-2 text-sm">
                                        <div className="flex justify-between rounded border p-2">
                                            <span className="text-gray-500">
                                                初手
                                            </span>

                                            <span className="font-medium">
                                                {getPartyPokemonDisplayName(
                                                    template.lead_pokemon,
                                                    pokemonList,
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between rounded border p-2">
                                            <span className="text-gray-500">
                                                引き先
                                            </span>

                                            <span className="font-medium">
                                                {getPartyPokemonDisplayName(
                                                    template.switch_pokemon,
                                                    pokemonList,
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between rounded border p-2">
                                            <span className="text-gray-500">
                                                勝ち筋
                                            </span>

                                            <span className="font-medium">
                                                {getPartyPokemonDisplayName(
                                                    template.finisher_pokemon,
                                                    pokemonList,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                            まだ保存済み基本選出がありません。
                        </p>
                    )}
                </div>

                <div className="rounded bg-gray-50 p-4">
                    <h3 className="font-bold">自動おすすめ基本選出</h3>

                    <p className="mt-1 text-sm text-gray-600">
                        現在の役割タグ点数から自動提案しています。
                    </p>

                    {currentPokemonCount >= selectionPokemonLimit ? (
                        <div className="mt-4 space-y-3">
                            {suggestedSelection.map((suggestion) => {
                                const pokemonMaster = suggestion.pokemon
                                    ? findPokemonMaster({
                                          pokemonList,
                                          pokemonKey:
                                              suggestion.pokemon.pokemon_key,
                                          formKey: suggestion.pokemon.form_key,
                                      })
                                    : null;

                                return (
                                    <div
                                        key={suggestion.role}
                                        className="rounded bg-white p-4"
                                    >
                                        <p className="text-xs font-semibold text-gray-500">
                                            {suggestion.label}
                                        </p>

                                        {suggestion.pokemon ? (
                                            <div className="mt-2 flex items-center gap-3">
                                                {pokemonMaster?.image_url ? (
                                                    <img
                                                        src={
                                                            pokemonMaster.image_url
                                                        }
                                                        alt={pokemonMaster.name}
                                                        className="h-12 w-12 object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-sm">
                                                        ?
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-semibold">
                                                        {suggestion.pokemon
                                                            .nickname ||
                                                            pokemonMaster?.name ||
                                                            suggestion.pokemon
                                                                .pokemon_key}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-600">
                                                        {suggestion.reason}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-sm text-gray-600">
                                                候補がありません。
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                            自動提案には自分のポケモンを
                            {selectionPokemonLimit}
                            匹以上登録してください。
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};
