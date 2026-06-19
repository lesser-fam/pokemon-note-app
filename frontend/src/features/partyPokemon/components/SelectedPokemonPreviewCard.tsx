import type { Pokemon } from "@/types/pokemon";

type SelectedPokemonPreviewCardProps = {
    pokemonKey: string;
    selectedPokemonMaster: Pokemon | undefined;
};

export const SelectedPokemonPreviewCard = ({
    pokemonKey,
    selectedPokemonMaster,
}: SelectedPokemonPreviewCardProps) => {
    if (!pokemonKey) {
        return (
            <div className="mt-5 rounded bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                    まず登録するポケモンを選択してください。
                </p>
            </div>
        );
    }

    return (
        <div className="mt-5 rounded border border-black bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500">
                選択中のポケモン
            </p>

            <div className="mt-2 flex items-center gap-3">
                {selectedPokemonMaster?.image_url && (
                    <img
                        src={selectedPokemonMaster.image_url}
                        alt={selectedPokemonMaster.name}
                        className="h-12 w-12 object-contain"
                    />
                )}

                <div>
                    <p className="font-bold">
                        {selectedPokemonMaster?.name || pokemonKey}
                    </p>

                    {selectedPokemonMaster && (
                        <p className="mt-1 text-xs text-gray-600">
                            {selectedPokemonMaster.types.join(" / ")}
                        </p>
                    )}
                </div>
            </div>

            <p className="mt-3 rounded bg-white px-3 py-2 text-xs text-gray-700">
                このポケモンの特性、持ち物、性格、努力値、技、役割タグを下で入力してください。
            </p>
        </div>
    );
};
