"use client";

import { pokemonTypes } from "@/constants/pokemonTypes";
import type { Pokemon } from "@/types/pokemon";
import { toHiragana } from "@/utils/kana";
import { getPokemonTypeMeta } from "@/features/pokemonTypes/pokemonTypeMeta";

type PokemonSearchSelectorProps = {
    pokemonList: Pokemon[];

    searchKeyword: string;
    onChangeSearchKeyword: (value: string) => void;

    selectedTypes: string[];
    onChangeSelectedTypes: (types: string[]) => void;

    onSelectPokemon: (pokemon: Pokemon) => void;

    filterPokemon?: (pokemon: Pokemon) => boolean;

    isPokemonSelected?: (pokemon: Pokemon) => boolean;

    isPokemonDisabled?: (pokemon: Pokemon) => boolean;

    getPokemonStatusLabel?: (pokemon: Pokemon) => string | null;

    clearSearchKeywordOnSelect?: boolean;

    initialLimit?: number;

    layout?: "wide" | "compact";
};

export function PokemonSearchSelector({
    pokemonList,
    searchKeyword,
    onChangeSearchKeyword,
    selectedTypes,
    onChangeSelectedTypes,
    onSelectPokemon,
    filterPokemon = () => true,
    isPokemonSelected = () => false,
    isPokemonDisabled = () => false,
    getPokemonStatusLabel = () => null,
    clearSearchKeywordOnSelect = false,
    initialLimit = 30,
    layout = "wide",
}: PokemonSearchSelectorProps) {
    const handleToggleType = (type: string) => {
        if (selectedTypes.includes(type)) {
            onChangeSelectedTypes(
                selectedTypes.filter((selectedType) => selectedType !== type),
            );

            return;
        }

        if (selectedTypes.length >= 2) {
            onChangeSelectedTypes([selectedTypes[1], type]);

            return;
        }

        onChangeSelectedTypes([...selectedTypes, type]);
    };

    const normalizedKeyword = toHiragana(searchKeyword.trim());

    const filteredPokemonList = pokemonList.filter((pokemon) => {
        if (!filterPokemon(pokemon)) {
            return false;
        }

        const normalizedName = toHiragana(pokemon.name);

        const normalizedKana = toHiragana(pokemon.kana);

        const matchesKeyword =
            normalizedKeyword === "" ||
            normalizedName.includes(normalizedKeyword) ||
            normalizedKana.includes(normalizedKeyword);

        const matchesTypes =
            selectedTypes.length === 0 ||
            selectedTypes.every((type) => pokemon.types.includes(type));

        return matchesKeyword && matchesTypes;
    });

    const hasPokemonFilter =
        normalizedKeyword !== "" || selectedTypes.length > 0;

    const visiblePokemonList = hasPokemonFilter
        ? filteredPokemonList
        : filteredPokemonList.slice(0, initialLimit);

    const isCompactLayout = layout === "compact";

    return (
        <div
            className={
                isCompactLayout
                    ? "min-w-0 space-y-4"
                    : "grid min-w-0 gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]"
            }
        >
            <div>
                <div>
                    <label className="block text-sm font-medium">
                        ポケモン名で検索
                    </label>

                    <input
                        className="mt-1 w-full rounded border px-3 py-2"
                        value={searchKeyword}
                        onChange={(event) =>
                            onChangeSearchKeyword(event.target.value)
                        }
                        placeholder="例：リザードン、りざ、ガブ"
                    />
                </div>

                <div className="mt-4">
                    <p className="text-sm font-medium">タイプで絞り込み</p>

                    <p className="mt-1 text-xs text-gray-500">
                        2つ選ぶと、両方のタイプを持つポケモンを表示します。
                    </p>

                    <div className="mt-2 grid grid-cols-6 gap-1">
                        {pokemonTypes.map((type) => {
                            const isSelected = selectedTypes.includes(type);
                            const typeMeta = getPokemonTypeMeta(type);

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleToggleType(type)}
                                    className={`whitespace-nowrap rounded-full border px-0.5 py-1 text-[10px] leading-none ${
                                        isSelected
                                            ? `${typeMeta.className} ring-2 ring-black`
                                            : `${typeMeta.className} opacity-80 hover:opacity-100`
                                    }`}
                                >
                                    {typeMeta.label}
                                </button>
                            );
                        })}
                    </div>

                    {selectedTypes.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onChangeSelectedTypes([])}
                            className="mt-2 text-xs text-blue-600"
                        >
                            タイプ絞り込みを解除
                        </button>
                    )}
                </div>

                <div className="mt-5 rounded bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">
                        候補：
                        {filteredPokemonList.length}件
                        {!hasPokemonFilter &&
                            filteredPokemonList.length >
                                visiblePokemonList.length &&
                            ` / 初期表示 ${visiblePokemonList.length}件`}
                    </p>

                    {!hasPokemonFilter &&
                        filteredPokemonList.length >
                            visiblePokemonList.length && (
                            <p className="mt-1 text-[10px] text-gray-400">
                                名前またはタイプで絞り込むと、ほかの候補も表示されます。
                            </p>
                        )}
                </div>
            </div>

            <div className="min-w-0">
                <div
                    className={`min-w-0 overflow-x-hidden overflow-y-auto rounded border bg-gray-50 ${
                        isCompactLayout ? "max-h-72 p-2" : "max-h-112 p-3"
                    }`}
                >
                    <div
                        className={
                            isCompactLayout
                                ? "grid min-w-0 grid-cols-3 gap-2"
                                : "grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3"
                        }
                    >
                        {visiblePokemonList.map((pokemon) => {
                            const selected = isPokemonSelected(pokemon);

                            const disabled = isPokemonDisabled(pokemon);

                            const statusLabel = getPokemonStatusLabel(pokemon);

                            return (
                                <button
                                    key={`${pokemon.key}-${pokemon.form_key}`}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                        onSelectPokemon(pokemon);
                                        if (clearSearchKeywordOnSelect) {
                                            onChangeSearchKeyword("");
                                        }
                                    }}
                                    className={`w-full min-w-0 overflow-hidden rounded border bg-white text-left transition disabled:cursor-not-allowed ${
                                        isCompactLayout ? "p-2" : "p-2.5"
                                    } ${
                                        disabled
                                            ? "opacity-50"
                                            : selected
                                              ? "border-black bg-gray-100 ring-2 ring-black"
                                              : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div
                                        className={`flex min-w-0 items-center ${
                                            isCompactLayout ? "gap-2" : "gap-3"
                                        }`}
                                    >
                                        {pokemon.image_url ? (
                                            <img
                                                src={pokemon.image_url}
                                                alt={pokemon.name}
                                                className={`shrink-0 object-contain ${
                                                    isCompactLayout
                                                        ? "h-10 w-10"
                                                        : "h-12 w-12"
                                                }`}
                                            />
                                        ) : (
                                            <div
                                                className={`flex shrink-0 items-center justify-center rounded bg-gray-100 ${
                                                    isCompactLayout
                                                        ? "h-10 w-10 text-xs"
                                                        : "h-12 w-12 text-sm"
                                                }`}
                                            >
                                                ?
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`truncate font-bold ${
                                                    isCompactLayout
                                                        ? "text-xs"
                                                        : "text-sm"
                                                }`}
                                            >
                                                {pokemon.name}
                                            </p>

                                            <p
                                                className={`truncate text-gray-600 ${
                                                    isCompactLayout
                                                        ? "text-[10px]"
                                                        : "text-[11px]"
                                                }`}
                                            >
                                                {pokemon.kana}
                                            </p>

                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {pokemon.types.map((type) => {
                                                    const typeMeta =
                                                        getPokemonTypeMeta(
                                                            type,
                                                        );

                                                    return (
                                                        <span
                                                            key={type}
                                                            className={`rounded-full border px-1.5 py-0.5 font-semibold leading-none ${typeMeta.className} ${
                                                                isCompactLayout
                                                                    ? "text-[9px]"
                                                                    : "text-[10px]"
                                                            }`}
                                                        >
                                                            {typeMeta.label}
                                                        </span>
                                                    );
                                                })}
                                            </div>

                                            {statusLabel && (
                                                <p
                                                    className={`mt-0.5 text-gray-500 ${
                                                        isCompactLayout
                                                            ? "text-[10px]"
                                                            : "text-[11px]"
                                                    }`}
                                                >
                                                    {statusLabel}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {filteredPokemonList.length === 0 && (
                    <p className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
                        条件に合うポケモンが見つかりません。
                    </p>
                )}
            </div>
        </div>
    );
}
