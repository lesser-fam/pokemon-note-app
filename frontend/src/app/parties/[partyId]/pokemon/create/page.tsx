"use client";

import { pokemonTypes } from "@/constants/pokemonTypes";
import {
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { createPartyPokemon } from "@/features/partyPokemon/api/partyPokemonApi";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";
import { toHiragana } from "@/utils/kana";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function CreatePartyPokemonPage() {
    const router = useRouter();
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [roleTags, setRoleTags] = useState<RoleTag[]>([]);

    const [pokemonKey, setPokemonKey] = useState("");
    const [formKey, setFormKey] = useState("default");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [nickname, setNickname] = useState("");
    const [item, setItem] = useState("");
    const [ability, setAbility] = useState("");
    const [nature, setNature] = useState("");
    const [move1, setMove1] = useState("");
    const [move2, setMove2] = useState("");
    const [move3, setMove3] = useState("");
    const [move4, setMove4] = useState("");
    const [memo, setMemo] = useState("");
    const [selectedRoleTagIds, setSelectedRoleTagIds] = useState<number[]>([]);
    const [activeRoleTag, setActiveRoleTag] = useState<RoleTag | null>(null);

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

    if (isInvalidPartyId) {
        return (
            <main className="mx-auto max-w-5x1 p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    パーティIDが正しくありません。
                </p>
            </main>
        );
    }

    const handleSelectPokemon = (pokemon: Pokemon) => {
        setPokemonKey(pokemon.key);
        setFormKey(pokemon.form_key);
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

    const handleToggleRoleTag = (roleTagId: number) => {
        setSelectedRoleTagIds((currentIds) => {
            if (currentIds.includes(roleTagId)) {
                return currentIds.filter((id) => id !== roleTagId);
            }

            return [...currentIds, roleTagId];
        });
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

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await createPartyPokemon(party.current_version.id, {
                pokemon_key: pokemonKey,
                form_key: formKey,
                nickname,
                item,
                ability,
                nature,
                move_1: move1,
                move_2: move2,
                move_3: move3,
                move_4: move4,
                memo,
                role_tag_ids: selectedRoleTagIds,
            });

            router.push(`/parties/${party.id}`);
        } catch (error) {
            console.error(error);
            setErrorMessage("ポケモン登録に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="mx-auto max-w-5xl p-8">
                <p>読み込み中...</p>
            </main>
        );
    }

    if (!party) {
        return (
            <main className="mx-auto max-w-5xl p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    パーティが見つかりません。
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl p-8">
            <Link
                href={`/parties/${party.id}`}
                className="text-sm text-blue-600"
            >
                ← パーティ詳細へ戻る
            </Link>

            <h1 className="mt-4 text-2xl font-bold">ポケモン追加</h1>
            <p className="mt-1 text-sm text-gray-600">
                {party.name} に登録するポケモンを追加します。
            </p>

            {errorMessage && (
                <p className="mt-6 rounded bg-red-100 p-3 text-red-700">
                    {errorMessage}
                </p>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                <section className="rounded border p-6">
                    <h2 className="text-lg font-bold">ポケモン選択</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        名前・かな・タイプから登録するポケモンを探せます。
                    </p>

                    <div className="mt-4">
                        <label className="block text-sm font-medium">
                            ポケモン名で検索
                        </label>
                        <input
                            className="mt-1 w-full rounded border p-3"
                            value={searchKeyword}
                            onChange={(event) =>
                                setSearchKeyword(event.target.value)
                            }
                            placeholder="例：リザードン、りざ、ガブ"
                        />
                    </div>

                    <div className="mt-5">
                        <p className="text-sm font-medium">タイプで絞り込み</p>
                        <p className="mt-1 text-xs text-gray-500">
                            1つ選ぶと、そのタイプを含むポケモンを表示します。2つ選ぶと、その2タイプを両方持つポケモンを表示します。
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {pokemonTypes.map((type) => {
                                const isSelected = selectedTypes.includes(type);

                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleToggleType(type)}
                                        className={`rounded-full border px-3 py-1 text-sm ${
                                            isSelected
                                                ? "border-black bg-black text-white"
                                                : "hover:bg-gray-50"
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
                                onClick={() => setSelectedTypes([])}
                                className="mt-3 text-sm text-blue-600"
                            >
                                タイプ絞り込みを解除
                            </button>
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            候補：{filteredPokemonList.length}件
                        </p>

                        {pokemonKey && (
                            <p className="text-sm font-medium">
                                選択中：{pokemonKey} / {formKey}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {filteredPokemonList.map((pokemon) => {
                            const isSelected =
                                pokemon.key === pokemonKey &&
                                pokemon.form_key === formKey;

                            return (
                                <button
                                    key={`${pokemon.key}-${pokemon.form_key}`}
                                    type="button"
                                    onClick={() => handleSelectPokemon(pokemon)}
                                    className={`rounded border p-3 text-left transition ${
                                        isSelected
                                            ? "border-black bg-gray-100 ring-2 ring-black"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {pokemon.image_url ? (
                                            <img
                                                src={pokemon.image_url}
                                                alt={pokemon.name}
                                                className="h-16 w-16 object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-sm">
                                                ?
                                            </div>
                                        )}

                                        <div>
                                            <p className="font-bold">
                                                {pokemon.name}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {pokemon.kana}
                                            </p>
                                            <p className="mt-1 text-xs">
                                                {pokemon.types.join(" / ")}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {filteredPokemonList.length === 0 && (
                        <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                            条件に合うポケモンが見つかりません。
                        </p>
                    )}
                </section>

                <section className="rounded border p-6">
                    <h2 className="text-lg font-bold">型・技情報</h2>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">
                                ニックネーム・表示名
                            </label>
                            <input
                                className="mt-1 w-full rounded border p-3"
                                value={nickname}
                                onChange={(event) =>
                                    setNickname(event.target.value)
                                }
                                placeholder="空欄ならポケモン名で表示"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                持ち物
                            </label>
                            <input
                                className="mt-1 w-full rounded border p-3"
                                value={item}
                                onChange={(event) =>
                                    setItem(event.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                特性
                            </label>
                            <input
                                className="mt-1 w-full rounded border p-3"
                                value={ability}
                                onChange={(event) =>
                                    setAbility(event.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                性格
                            </label>
                            <input
                                className="mt-1 w-full rounded border p-3"
                                value={nature}
                                onChange={(event) =>
                                    setNature(event.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                技1
                            </label>
                            <input
                                className="mt-1 w-full rounded border p-3"
                                value={move1}
                                onChange={(event) =>
                                    setMove1(event.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                技2
                            </label>
                            <input
                                className="mt-1 w-full rounded border p-3"
                                value={move2}
                                onChange={(event) =>
                                    setMove2(event.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                技3
                            </label>
                            <input
                                className="mt-1 w-full rounded border p-3"
                                value={move3}
                                onChange={(event) =>
                                    setMove3(event.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                技4
                            </label>
                            <input
                                className="mt-1 w-full rounded border p-3"
                                value={move4}
                                onChange={(event) =>
                                    setMove4(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium">
                            メモ
                        </label>
                        <textarea
                            className="mt-1 w-full rounded border p-3"
                            value={memo}
                            onChange={(event) => setMemo(event.target.value)}
                            rows={4}
                        />
                    </div>
                </section>

                <section className="rounded border p-6">
                    <h2 className="text-lg font-bold">役割タグ</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        このポケモンがパーティ内で担当する役割を選びます。
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                        {roleTags.map((tag) => {
                            const isSelected = selectedRoleTagIds.includes(
                                tag.id,
                            );

                            return (
                                <div
                                    key={tag.id}
                                    className={`flex items-center overflow-hidden rounded-full border ${isSelected ? "border-black bg-black text-white" : "bg-white"}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggleRoleTag(tag.id)
                                        }
                                        className={`px-4 py-2 text-sm ${
                                            isSelected
                                                ? "text-white"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        {tag.name}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveRoleTag(tag)}
                                        className={`border-l px-3 py-2 text-sm ${isSelected ? "border-gray-600 text-white hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50"}`}
                                        aria-label={`${tag.name}の説明を見る`}
                                    >
                                        ?
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <button
                    type="submit"
                    disabled={isSubmitting || !pokemonKey}
                    className="rounded bg-black px-5 py-3 text-white disabled:opacity-50"
                >
                    {isSubmitting ? "登録中..." : "ポケモンを登録する"}
                </button>
            </form>

            {activeRoleTag && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded bg-white p-6 shadow-lg">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold">
                                    {activeRoleTag.name}
                                </h2>
                                <p className="mt-2 text-sm text-gray-700">
                                    {activeRoleTag.description}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveRoleTag(null)}
                                className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                            >
                                閉じる
                            </button>
                        </div>

                        {activeRoleTag.examples &&
                            activeRoleTag.examples.length > 0 && (
                                <div className="mt-5">
                                    <h3 className="font-semibold">
                                        付ける目安・技や型の例
                                    </h3>

                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                                        {activeRoleTag.examples.map(
                                            (example) => (
                                                <li key={example}>{example}</li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}

                        <div className="mt-5 rounded bg-gray-50 p-4 text-sm text-gray-700">
                            <p className="font-semibold">
                                おすすめ選出への影響
                            </p>
                            <p className="mt-1">
                                初手：{activeRoleTag.lead_score}点 / 引き先：
                                {activeRoleTag.switch_score}点 / 勝ち筋：
                                {activeRoleTag.finisher_score}点
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
