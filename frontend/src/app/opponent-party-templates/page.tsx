"use client";

import { fetchPokemonList } from "@/features/master/api/masterApi";
import {
    createOpponentPartyTemplate,
    deleteOpponentPartyTemplate,
    fetchOpponentPartyTemplates,
} from "@/features/opponentPartyTemplates/api/opponentPartyTemplateApi";
import { PokemonSearchSelector } from "@/features/partyPokemon/components/PokemonSearchSelector";
import type { OpponentPartyTemplate } from "@/types/opponentPartyTemplate";
import type { Pokemon } from "@/types/pokemon";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const getPokemonIdentifier = (pokemon: Pokemon): string => {
    return `${pokemon.key}:${pokemon.form_key}`;
};

function OpponentPartyTemplatesContent() {
    const searchParams = useSearchParams();

    const partyIdParam = searchParams.get("partyId");
    const partyId = partyIdParam ? Number(partyIdParam) : null;

    const hasValidPartyId =
        partyId !== null && Number.isInteger(partyId) && partyId > 0;

    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [templates, setTemplates] = useState<OpponentPartyTemplate[]>([]);
    const [selectedPokemonList, setSelectedPokemonList] = useState<Pokemon[]>(
        [],
    );

    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [memo, setMemo] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(
        null,
    );
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [pokemonData, templateData] = await Promise.all([
                    fetchPokemonList(),
                    fetchOpponentPartyTemplates(),
                ]);

                setPokemonList(pokemonData);
                setTemplates(templateData);
            } catch (error) {
                console.error(error);
                setErrorMessage("必要なデータの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const handleAddPokemon = (pokemon: Pokemon) => {
        if (selectedPokemonList.length >= 6) {
            setErrorMessage("テンプレートには6匹まで登録できます。");
            return;
        }

        const alreadySelected = selectedPokemonList.some(
            (selectedPokemon) => selectedPokemon.key === pokemon.key,
        );

        if (alreadySelected) {
            setErrorMessage("同じポケモンを重複して登録することはできません。");
            return;
        }

        setSelectedPokemonList((currentList) => [...currentList, pokemon]);
        setSearchKeyword("");
        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleRemovePokemon = (pokemon: Pokemon) => {
        setSelectedPokemonList((currentList) =>
            currentList.filter(
                (selectedPokemon) =>
                    getPokemonIdentifier(selectedPokemon) !==
                    getPokemonIdentifier(pokemon),
            ),
        );

        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleMovePokemon = (
        pokemonIdentifier: string,
        direction: "up" | "down",
    ) => {
        setSelectedPokemonList((currentList) => {
            const currentIndex = currentList.findIndex(
                (pokemon) =>
                    getPokemonIdentifier(pokemon) === pokemonIdentifier,
            );

            if (currentIndex < 0) {
                return currentList;
            }

            const nextIndex =
                direction === "up" ? currentIndex - 1 : currentIndex + 1;

            if (nextIndex < 0 || nextIndex >= currentList.length) {
                return currentList;
            }

            const nextList = [...currentList];

            [nextList[currentIndex], nextList[nextIndex]] = [
                nextList[nextIndex],
                nextList[currentIndex],
            ];

            return nextList;
        });
    };

    const handleClearSelectedPokemon = () => {
        setSelectedPokemonList([]);
        setMemo("");
        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleSave = async () => {
        if (selectedPokemonList.length !== 6) {
            setErrorMessage("ポケモンを6匹選択してください。");
            return;
        }

        if (isSaving) {
            return;
        }

        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const createdTemplate = await createOpponentPartyTemplate({
                memo: memo.trim() || null,
                pokemon: selectedPokemonList.map((pokemon) => ({
                    pokemon_key: pokemon.key,
                    form_key: pokemon.form_key,
                })),
            });

            setTemplates((currentTemplates) => [
                createdTemplate,
                ...currentTemplates,
            ]);

            setSelectedPokemonList([]);
            setMemo("");
            setSearchKeyword("");
            setSelectedTypes([]);
            setSuccessMessage("相手パーティテンプレートを登録しました。");
        } catch (error) {
            console.error(error);
            setErrorMessage("相手パーティテンプレートの登録に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (templateId: number) => {
        if (deletingTemplateId !== null) {
            return;
        }

        setDeletingTemplateId(templateId);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            await deleteOpponentPartyTemplate(templateId);

            setTemplates((currentTemplates) =>
                currentTemplates.filter(
                    (template) => template.id !== templateId,
                ),
            );

            setSuccessMessage("相手パーティテンプレートを削除しました。");
        } catch (error) {
            console.error(error);
            setErrorMessage("相手パーティテンプレートの削除に失敗しました。");
        } finally {
            setDeletingTemplateId(null);
        }
    };

    const findPokemonMaster = (
        pokemonKey: string,
        formKey: string,
    ): Pokemon | undefined => {
        return (
            pokemonList.find(
                (pokemon) =>
                    pokemon.key === pokemonKey && pokemon.form_key === formKey,
            ) ??
            pokemonList.find(
                (pokemon) =>
                    pokemon.key === pokemonKey &&
                    pokemon.form_key === "default",
            )
        );
    };

    if (isLoading) {
        return (
            <main className="mx-auto max-w-7xl p-6">
                <p>読み込み中...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl p-6">
            <div className="mb-4 flex flex-wrap gap-3">
                <Link
                    href={hasValidPartyId ? `/parties/${partyId}` : "/parties"}
                    className="text-sm text-blue-600"
                >
                    {hasValidPartyId
                        ? "← パーティ詳細へ戻る"
                        : "← パーティ一覧へ戻る"}
                </Link>

                {hasValidPartyId && (
                    <Link
                        href={`/parties/${partyId}/selection-practice`}
                        className="text-sm text-blue-600"
                    >
                        選出練習モードへ戻る
                    </Link>
                )}
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    相手パーティテンプレート登録
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                    環境上位で使われているパーティなどを6匹単位で登録します。
                    登録したテンプレートは選出練習モードでランダム生成に使います。
                </p>
            </div>

            {errorMessage && (
                <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                    {errorMessage}
                </p>
            )}

            {successMessage && (
                <p className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
                    {successMessage}
                </p>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <section className="rounded border bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold">
                                ポケモンを検索
                            </h2>

                            <p className="mt-1 text-sm text-gray-600">
                                テンプレートに登録する6匹を選択してください。
                            </p>
                        </div>

                        <span className="rounded bg-gray-100 px-3 py-1 text-sm font-semibold">
                            {selectedPokemonList.length} / 6
                        </span>
                    </div>

                    <div className="mt-4">
                        <PokemonSearchSelector
                            layout="compact"
                            pokemonList={pokemonList}
                            searchKeyword={searchKeyword}
                            onChangeSearchKeyword={setSearchKeyword}
                            clearSearchKeywordOnSelect
                            selectedTypes={selectedTypes}
                            onChangeSelectedTypes={setSelectedTypes}
                            isPokemonSelected={(pokemon) =>
                                selectedPokemonList.some(
                                    (selectedPokemon) =>
                                        selectedPokemon.key === pokemon.key,
                                )
                            }
                            isPokemonDisabled={(pokemon) =>
                                selectedPokemonList.length >= 6 ||
                                selectedPokemonList.some(
                                    (selectedPokemon) =>
                                        selectedPokemon.key === pokemon.key,
                                )
                            }
                            getPokemonStatusLabel={(pokemon) =>
                                selectedPokemonList.some(
                                    (selectedPokemon) =>
                                        selectedPokemon.key === pokemon.key,
                                )
                                    ? "選択済み"
                                    : null
                            }
                            onSelectPokemon={handleAddPokemon}
                        />
                    </div>
                </section>

                <aside className="rounded border bg-white p-4 lg:sticky lg:top-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold">登録予定</h2>

                        {selectedPokemonList.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearSelectedPokemon}
                                className="text-xs text-red-600"
                            >
                                すべて外す
                            </button>
                        )}
                    </div>

                    {selectedPokemonList.length === 0 ? (
                        <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                            まだポケモンが選択されていません。
                        </p>
                    ) : (
                        <div className="mt-4 space-y-2">
                            {selectedPokemonList.map((pokemon, index) => (
                                <div
                                    key={getPokemonIdentifier(pokemon)}
                                    className="flex items-center gap-2 rounded border bg-gray-50 p-2"
                                >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                                        {index + 1}
                                    </span>

                                    {pokemon.image_url ? (
                                        <img
                                            src={pokemon.image_url}
                                            alt={pokemon.name}
                                            className="h-10 w-10 shrink-0 object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white text-xs text-gray-400">
                                            ?
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold">
                                            {pokemon.name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {pokemon.types.join(" / ")}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMovePokemon(
                                                    getPokemonIdentifier(
                                                        pokemon,
                                                    ),
                                                    "up",
                                                )
                                            }
                                            disabled={index === 0}
                                            className="rounded border px-1.5 py-1 text-xs disabled:text-gray-300"
                                        >
                                            ↑
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMovePokemon(
                                                    getPokemonIdentifier(
                                                        pokemon,
                                                    ),
                                                    "down",
                                                )
                                            }
                                            disabled={
                                                index ===
                                                selectedPokemonList.length - 1
                                            }
                                            className="rounded border px-1.5 py-1 text-xs disabled:text-gray-300"
                                        >
                                            ↓
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemovePokemon(pokemon)
                                            }
                                            className="rounded border border-red-200 px-1.5 py-1 text-xs text-red-600 hover:bg-red-50"
                                        >
                                            外す
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4">
                        <label className="text-sm font-semibold">
                            メモ 任意
                        </label>

                        <input
                            value={memo}
                            onChange={(event) => setMemo(event.target.value)}
                            placeholder="例：S2上位構築、雨パーティ、受け寄りなど"
                            maxLength={255}
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                        />

                        <p className="mt-1 text-right text-xs text-gray-400">
                            {memo.length} / 255
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={selectedPokemonList.length !== 6 || isSaving}
                        className="mt-4 w-full rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        {isSaving ? "登録中..." : "テンプレートを登録"}
                    </button>
                </aside>
            </div>

            <section className="mt-8 rounded border bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold">
                            登録済みテンプレート
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                            登録済みの相手パーティを確認・削除できます。
                        </p>
                    </div>

                    <span className="rounded bg-gray-100 px-3 py-1 text-sm font-semibold">
                        {templates.length} 件
                    </span>
                </div>

                {templates.length === 0 ? (
                    <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                        まだテンプレートが登録されていません。
                    </p>
                ) : (
                    <div className="mt-4 space-y-4">
                        {templates.map((template, templateIndex) => (
                            <div
                                key={template.id}
                                className="rounded border bg-gray-50 p-4"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold">
                                            テンプレート {templateIndex + 1}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-600">
                                            {template.memo || "メモなし"}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(template.id)
                                        }
                                        disabled={
                                            deletingTemplateId === template.id
                                        }
                                        className="rounded border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:text-gray-400"
                                    >
                                        {deletingTemplateId === template.id
                                            ? "削除中..."
                                            : "削除"}
                                    </button>
                                </div>

                                <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                                    {template.pokemon.map((templatePokemon) => {
                                        const pokemonMaster = findPokemonMaster(
                                            templatePokemon.pokemon_key,
                                            templatePokemon.form_key,
                                        );

                                        return (
                                            <div
                                                key={templatePokemon.id}
                                                className="rounded bg-white p-3 text-center"
                                            >
                                                <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold">
                                                    {
                                                        templatePokemon.display_order
                                                    }
                                                </span>

                                                {pokemonMaster?.image_url ? (
                                                    <img
                                                        src={
                                                            pokemonMaster.image_url
                                                        }
                                                        alt={pokemonMaster.name}
                                                        className="mx-auto mt-2 h-14 w-14 object-contain"
                                                    />
                                                ) : (
                                                    <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded bg-gray-50 text-xs text-gray-400">
                                                        ?
                                                    </div>
                                                )}

                                                <p className="mt-2 truncate text-xs font-semibold">
                                                    {pokemonMaster?.name ||
                                                        templatePokemon.pokemon_key}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default function OpponentPartyTemplatesPage() {
    return (
        <Suspense
            fallback={
                <main className="mx-auto max-w-7xl p-6">
                    <p>読み込み中...</p>
                </main>
            }
        >
            <OpponentPartyTemplatesContent />
        </Suspense>
    );
}
