"use client";

import { AppHeader } from "@/components/AppHeader";
import {
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { createNewPartyVersion } from "@/features/partyVersions/api/partyVersionApi";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";
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

const emptyPokemon: EditablePokemon = {
    pokemon_key: "",
    form_key: "default",
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

                {errorMessage && (
                    <p className="mt-6 rounded bg-red-100 p-3 text-red-700">
                        {errorMessage}
                    </p>
                )}

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
                    </section>

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
