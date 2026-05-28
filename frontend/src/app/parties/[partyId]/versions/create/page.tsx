"use client";

import { AppHeader } from "@/components/AppHeader";
import { pokemonTypes } from "@/constants/pokemonTypes";
import {
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { createNewPartyVersion } from "@/features/partyVersions/api/partyVersionApi";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";
import { toHiragana } from "@/utils/kana";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type EditablePokemon = {
    pokemon_key: string;
    form_key: string;
    nickname: string;
    item: string;
    ability: string;
    nature: string;
    move_1: string;
    move_2: string;
    move_3: string;
    move_4: string;
    memo: string;
    role_tag_ids: number[];
};

export default function CreatePartyVersionPage() {
    const router = useRouter();
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [roleTags, setRoleTags] = useState<RoleTag[]>([]);
    const [editablePokemonList, setEditablePokemonList] = useState<
        EditablePokemon[]
    >([]);
    const [changeNote, setChangeNote] = useState("");
    const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(
        null,
    );
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [partyData, pokemonData, roleTagData] = await Promise.all(
                    [fetchParty(partyId), fetchPokemonList(), fetchRoleTags()],
                );

                setParty(partyData);
                setPokemonList(pokemonData);
                setRoleTags(roleTagData);

                const currentPokemon = partyData.current_version?.pokemon ?? [];

                const initialEditablePokemon = currentPokemon.map(
                    (pokemon) => ({
                        pokemon_key: pokemon.pokemon_key,
                        form_key: pokemon.form_key,
                        nickname: pokemon.nickname ?? "",
                        item: pokemon.item ?? "",
                        ability: pokemon.ability ?? "",
                        nature: pokemon.nature ?? "",
                        move_1: pokemon.move_1 ?? "",
                        move_2: pokemon.move_2 ?? "",
                        move_3: pokemon.move_3 ?? "",
                        move_4: pokemon.move_4 ?? "",
                        memo: pokemon.memo ?? "",
                        role_tag_ids:
                            pokemon.role_tags?.map((tag) => tag.id) ?? [],
                    }),
                );

                setEditablePokemonList(initialEditablePokemon);
            } catch (error) {
                console.error(error);
                setErrorMessage("必要なデータの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (isInvalidPartyId) {
            return;
        }

        loadData();
    }, [partyId, isInvalidPartyId]);

    const findPokemonMaster = (pokemonKey: string, formKey: string) => {
        return pokemonList.find(
            (pokemon) =>
                pokemon.key === pokemonKey && pokemon.form_key === formKey,
        );
    };

    const updatePokemon = (
        index: number,
        field: keyof EditablePokemon,
        value: string | number[],
    ) => {
        setEditablePokemonList((currentList) =>
            currentList.map((pokemon, currentIndex) =>
                currentIndex === index
                    ? {
                          ...pokemon,
                          [field]: value,
                      }
                    : pokemon,
            ),
        );
    };

    const toggleRoleTag = (index: number, roleTagId: number) => {
        setEditablePokemonList((currentList) =>
            currentList.map((pokemon, currentIndex) => {
                if (currentIndex !== index) {
                    return pokemon;
                }

                const hasTag = pokemon.role_tag_ids.includes(roleTagId);

                return {
                    ...pokemon,
                    role_tag_ids: hasTag
                        ? pokemon.role_tag_ids.filter((id) => id !== roleTagId)
                        : [...pokemon.role_tag_ids, roleTagId],
                };
            }),
        );
    };

    const createEditablePokemon = (pokemon: Pokemon): EditablePokemon => {
        return {
            pokemon_key: pokemon.key,
            form_key: pokemon.form_key,
            nickname: "",
            item: "",
            ability: "",
            nature: "",
            move_1: "",
            move_2: "",
            move_3: "",
            move_4: "",
            memo: "",
            role_tag_ids: [],
        };
    };

    const handleRemovePokemon = (index: number) => {
        setEditablePokemonList((currentList) =>
            currentList.filter((_, currentIndex) => currentIndex !== index),
        );

        if (replaceTargetIndex === index) {
            setReplaceTargetIndex(null);
        }
    };

    const handleAddPokemon = (pokemon: Pokemon) => {
        if (editablePokemonList.length >= 6) {
            return;
        }

        setEditablePokemonList((currentList) => [
            ...currentList,
            createEditablePokemon(pokemon),
        ]);
    };

    const handleReplacePokemon = (pokemon: Pokemon) => {
        if (replaceTargetIndex === null) {
            return;
        }

        setEditablePokemonList((currentList) =>
            currentList.map((currentPokemon, currentIndex) =>
                currentIndex === replaceTargetIndex
                    ? createEditablePokemon(pokemon)
                    : currentPokemon,
            ),
        );

        setReplaceTargetIndex(null);
    };

    const handleToggleType = (type: string) => {
        setSelectedTypes((currentTypes) => {
            if (currentTypes.includes(type)) {
                return currentTypes.filter(
                    (currentType) => currentType !== type,
                );
            }

            if (currentTypes.length >= 2) {
                return [currentTypes[1], type];
            }

            return [...currentTypes, type];
        });
    };

    const isAlreadySelectedPokemon = (pokemon: Pokemon) => {
        return editablePokemonList.some(
            (editablePokemon, index) =>
                index !== replaceTargetIndex &&
                editablePokemon.pokemon_key === pokemon.key &&
                editablePokemon.form_key === pokemon.form_key,
        );
    };

    const normalizedKeyword = toHiragana(searchKeyword.trim());

    const filteredPokemonList = pokemonList.filter((pokemon) => {
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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!party?.current_version) {
            setErrorMessage("現在のバージョンが見つかりません。");
            return;
        }

        if (editablePokemonList.length !== 6) {
            setErrorMessage("新しいバージョンは6匹そろえて保存してください。");
            return;
        }

        if (
            editablePokemonList.some(
                (pokemon) => !pokemon.pokemon_key || !pokemon.form_key,
            )
        ) {
            setErrorMessage("未選択のポケモンがあります。");
            return;
        }

        const pokemonKeys = editablePokemonList.map(
            (pokemon) => `${pokemon.pokemon_key}:${pokemon.form_key}`,
        );

        const hasDuplicatedPokemon =
            new Set(pokemonKeys).size !== pokemonKeys.length;

        if (hasDuplicatedPokemon) {
            setErrorMessage("同じポケモンは同じパーティに登録できません。");
            return;
        }

        const items = editablePokemonList
            .map((pokemon) => pokemon.item.trim())
            .filter((item) => item !== "");

        const hasDuplicatedItem = new Set(items).size !== items.length;

        if (hasDuplicatedItem) {
            setErrorMessage("同じ持ち物は同じパーティに登録できません。");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await createNewPartyVersion(party.current_version.id, {
                change_note: changeNote,
                pokemon: editablePokemonList,
            });

            router.push(`/parties/${party.id}`);
        } catch (error) {
            console.error(error);
            setErrorMessage("新バージョンの作成に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isInvalidPartyId) {
        return (
            <>
                <AppHeader />
                <main className="mx-auto max-w-5xl p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        パーティIDが正しくありません。
                    </p>
                </main>
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <AppHeader />
                <main className="mx-auto max-w-5xl p-8">
                    <p>読み込み中...</p>
                </main>
            </>
        );
    }

    if (!party) {
        return (
            <>
                <AppHeader />
                <main className="mx-auto max-w-5xl p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        パーティが見つかりません。
                    </p>
                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-6xl p-8">
                <Link
                    href={`/parties/${party.id}`}
                    className="text-sm text-blue-600"
                >
                    ← パーティ詳細へ戻る
                </Link>

                <h1 className="mt-4 text-2xl font-bold">新バージョン作成</h1>
                <p className="mt-1 text-sm text-gray-600">
                    現在のパーティを元に、6匹を調整して新しいバージョンとして保存します。
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                    <section className="rounded border p-6">
                        <h2 className="text-lg font-bold">変更メモ</h2>
                        <textarea
                            className="mt-3 w-full rounded border p-3"
                            rows={3}
                            value={changeNote}
                            onChange={(event) =>
                                setChangeNote(event.target.value)
                            }
                            placeholder="例：リザードンをバクフーンに変更。ハッサムの技構成を調整。"
                        />
                    </section>

                    <section className="rounded border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold">新しい6匹</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    現在の6匹を元に、型や役割タグを調整します。
                                </p>
                            </div>

                            <p className="text-sm font-medium">
                                {editablePokemonList.length} / 6
                            </p>
                        </div>

                        <div className="mt-6 space-y-6">
                            {editablePokemonList.map((pokemon, index) => {
                                const pokemonMaster = findPokemonMaster(
                                    pokemon.pokemon_key,
                                    pokemon.form_key,
                                );

                                return (
                                    <div
                                        key={`${pokemon.pokemon_key}-${pokemon.form_key}-${index}`}
                                        className="rounded border p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                {pokemonMaster?.image_url ? (
                                                    <img
                                                        src={
                                                            pokemonMaster.image_url
                                                        }
                                                        alt={pokemonMaster.name}
                                                        className="h-16 w-16 object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-sm">
                                                        ?
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-bold">
                                                        {pokemonMaster?.name ||
                                                            pokemon.pokemon_key}
                                                    </p>

                                                    {pokemonMaster && (
                                                        <p className="text-sm text-gray-600">
                                                            {pokemonMaster.types.join(
                                                                " / ",
                                                            )}
                                                        </p>
                                                    )}

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {index + 1}匹目
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setReplaceTargetIndex(
                                                            index,
                                                        )
                                                    }
                                                    className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                                                >
                                                    入れ替え
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemovePokemon(
                                                            index,
                                                        )
                                                    }
                                                    className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    外す
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium">
                                                    ニックネーム・表示名
                                                </label>
                                                <input
                                                    className="mt-1 w-full rounded border p-3"
                                                    value={pokemon.nickname}
                                                    onChange={(event) =>
                                                        updatePokemon(
                                                            index,
                                                            "nickname",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">
                                                    持ち物
                                                </label>
                                                <input
                                                    className="mt-1 w-full rounded border p-3"
                                                    value={pokemon.item}
                                                    onChange={(event) =>
                                                        updatePokemon(
                                                            index,
                                                            "item",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">
                                                    特性
                                                </label>
                                                <input
                                                    className="mt-1 w-full rounded border p-3"
                                                    value={pokemon.ability}
                                                    onChange={(event) =>
                                                        updatePokemon(
                                                            index,
                                                            "ability",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">
                                                    性格
                                                </label>
                                                <input
                                                    className="mt-1 w-full rounded border p-3"
                                                    value={pokemon.nature}
                                                    onChange={(event) =>
                                                        updatePokemon(
                                                            index,
                                                            "nature",
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            {(
                                                [
                                                    "move_1",
                                                    "move_2",
                                                    "move_3",
                                                    "move_4",
                                                ] as const
                                            ).map((moveField, moveIndex) => (
                                                <div key={moveField}>
                                                    <label className="block text-sm font-medium">
                                                        技{moveIndex + 1}
                                                    </label>
                                                    <input
                                                        className="mt-1 w-full rounded border p-3"
                                                        value={
                                                            pokemon[moveField]
                                                        }
                                                        onChange={(event) =>
                                                            updatePokemon(
                                                                index,
                                                                moveField,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium">
                                                メモ
                                            </label>
                                            <textarea
                                                className="mt-1 w-full rounded border p-3"
                                                rows={3}
                                                value={pokemon.memo}
                                                onChange={(event) =>
                                                    updatePokemon(
                                                        index,
                                                        "memo",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-sm font-medium">
                                                役割タグ
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {roleTags.map((tag) => {
                                                    const isSelected =
                                                        pokemon.role_tag_ids.includes(
                                                            tag.id,
                                                        );

                                                    return (
                                                        <button
                                                            key={tag.id}
                                                            type="button"
                                                            onClick={() =>
                                                                toggleRoleTag(
                                                                    index,
                                                                    tag.id,
                                                                )
                                                            }
                                                            className={`rounded-full border px-3 py-1 text-sm ${
                                                                isSelected
                                                                    ? "bg-black text-white"
                                                                    : "hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            {tag.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 rounded bg-gray-50 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold">
                                        {replaceTargetIndex === null
                                            ? "ポケモンを追加"
                                            : `${replaceTargetIndex + 1}匹目を入れ替え`}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {replaceTargetIndex === null
                                            ? "6匹未満の場合、ここからポケモンを追加できます。"
                                            : "選んだポケモンでこの枠を入れ替えます。"}
                                    </p>
                                </div>

                                {replaceTargetIndex !== null && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setReplaceTargetIndex(null)
                                        }
                                        className="text-sm text-blue-600"
                                    >
                                        入れ替えをやめる
                                    </button>
                                )}
                            </div>

                            {replaceTargetIndex === null &&
                            editablePokemonList.length >= 6 ? (
                                <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                                    すでに6匹そろっています。入れ替えたい場合は、各ポケモンの
                                    「入れ替え」ボタンを押してください。
                                </p>
                            ) : (
                                <>
                                    <div className="mt-4 rounded bg-white p-4">
                                        <label className="block text-sm font-medium">
                                            ポケモン名で検索
                                        </label>
                                        <input
                                            className="mt-1 w-full rounded border p-3"
                                            value={searchKeyword}
                                            onChange={(event) =>
                                                setSearchKeyword(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="例：リザードン、りざ、ガブ"
                                        />

                                        <div className="mt-5">
                                            <p className="text-sm font-medium">
                                                タイプで絞り込み
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                1つ選ぶと、そのタイプを含むポケモンを表示します。2つ選ぶと、その2タイプを両方持つポケモンを表示します。
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {pokemonTypes.map((type) => {
                                                    const isSelected =
                                                        selectedTypes.includes(
                                                            type,
                                                        );

                                                    return (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() =>
                                                                handleToggleType(
                                                                    type,
                                                                )
                                                            }
                                                            className={`rounded-full border px-3 py-1 text-sm ${
                                                                isSelected
                                                                    ? "border-black bg-black text-white"
                                                                    : "bg-white hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {selectedTypes.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedTypes([])
                                                    }
                                                    className="mt-3 text-sm text-blue-600"
                                                >
                                                    タイプ絞り込みを解除
                                                </button>
                                            )}
                                        </div>

                                        <p className="mt-4 text-sm text-gray-600">
                                            候補：{filteredPokemonList.length}件
                                        </p>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                        {filteredPokemonList.map((pokemon) => {
                                            const isSelected =
                                                isAlreadySelectedPokemon(
                                                    pokemon,
                                                );

                                            return (
                                                <button
                                                    key={`${pokemon.key}-${pokemon.form_key}`}
                                                    type="button"
                                                    disabled={isSelected}
                                                    onClick={() => {
                                                        if (
                                                            replaceTargetIndex ===
                                                            null
                                                        ) {
                                                            handleAddPokemon(
                                                                pokemon,
                                                            );
                                                            return;
                                                        }

                                                        handleReplacePokemon(
                                                            pokemon,
                                                        );
                                                    }}
                                                    className={`rounded border p-3 text-left disabled:cursor-not-allowed ${
                                                        isSelected
                                                            ? "bg-gray-100 opacity-50"
                                                            : "bg-white hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {pokemon.image_url ? (
                                                            <img
                                                                src={
                                                                    pokemon.image_url
                                                                }
                                                                alt={
                                                                    pokemon.name
                                                                }
                                                                className="h-14 w-14 object-contain"
                                                            />
                                                        ) : (
                                                            <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-sm">
                                                                ?
                                                            </div>
                                                        )}

                                                        <div>
                                                            <p className="font-bold">
                                                                {pokemon.name}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {pokemon.types.join(
                                                                    " / ",
                                                                )}
                                                            </p>
                                                            {isSelected && (
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    選択済み
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {filteredPokemonList.length === 0 && (
                                        <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                                            条件に合うポケモンが見つかりません。
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    {errorMessage && (
                        <p className="mt-6 rounded bg-red-100 p-3 text-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded bg-black px-5 py-3 text-white disabled:opacity-50"
                    >
                        {isSubmitting
                            ? "保存中..."
                            : "新しいバージョンとして保存"}
                    </button>
                </form>
            </main>
        </>
    );
}
