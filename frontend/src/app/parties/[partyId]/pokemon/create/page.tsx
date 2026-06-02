"use client";

import { AppHeader } from "@/components/AppHeader";
import { pokemonTypes } from "@/constants/pokemonTypes";
import {
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import { BattleMasterTextSelector } from "@/features/master/components/BattleMasterTextSelector";
import { MoveSelector } from "@/features/master/components/MoveSelector";
import { NatureSelector } from "@/features/master/components/NatureSelector";
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
    const [evH, setEvH] = useState("0");
    const [evA, setEvA] = useState("0");
    const [evB, setEvB] = useState("0");
    const [evC, setEvC] = useState("0");
    const [evD, setEvD] = useState("0");
    const [evS, setEvS] = useState("0");
    const [move1, setMove1] = useState("");
    const [move1Type, setMove1Type] = useState("");
    const [move2, setMove2] = useState("");
    const [move2Type, setMove2Type] = useState("");
    const [move3, setMove3] = useState("");
    const [move3Type, setMove3Type] = useState("");
    const [move4, setMove4] = useState("");
    const [move4Type, setMove4Type] = useState("");
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

    const selectedPokemonMaster = pokemonList.find(
        (pokemon) => pokemon.key === pokemonKey && pokemon.form_key === formKey,
    );

    const currentPokemonList = party?.current_version?.pokemon ?? [];

    const isAlreadyRegisteredPokemon = (pokemon: Pokemon) => {
        return currentPokemonList.some(
            (partyPokemon) =>
                partyPokemon.pokemon_key === pokemon.key &&
                partyPokemon.form_key === pokemon.form_key,
        );
    };

    const getEffortValueLimits = () => {
        const rule = party?.rule || "main_series";

        if (rule === "champions") {
            return {
                totalLimit: 66,
                singleLimit: 32,
                label: "チャンピオンズ",
            };
        }

        return {
            totalLimit: 510,
            singleLimit: 252,
            label: "本編ルール",
        };
    };

    const toNumber = (value: string) => {
        return Number(value || 0);
    };

    const effortValueTotal =
        toNumber(evH) +
        toNumber(evA) +
        toNumber(evB) +
        toNumber(evC) +
        toNumber(evD) +
        toNumber(evS);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!party?.current_version) {
            setErrorMessage("現在のバージョンが見つかりません。");
            return;
        }

        if (!pokemonKey || !formKey) {
            setErrorMessage("ポケモンを選択してください。");
            return;
        }

        if (currentPokemonList.length >= 6) {
            setErrorMessage("このパーティにはすでに6匹登録されています。");
            return;
        }

        const isDuplicatedPokemon = currentPokemonList.some(
            (partyPokemon) =>
                partyPokemon.pokemon_key === pokemonKey &&
                partyPokemon.form_key === formKey,
        );

        if (isDuplicatedPokemon) {
            setErrorMessage("同じポケモンは同じパーティに登録できません。");
            return;
        }

        const normalizedItem = item.trim();

        const hasDuplicatedItem =
            normalizedItem !== "" &&
            currentPokemonList.some(
                (partyPokemon) => partyPokemon.item?.trim() === normalizedItem,
            );

        if (hasDuplicatedItem) {
            setErrorMessage("同じ持ち物は同じパーティに登録できません。");
            return;
        }

        const moves = [move1, move2, move3, move4]
            .map((move) => move.trim())
            .filter((move) => move !== "");

        const hasDuplicatedMove = new Set(moves).size !== moves.length;

        if (hasDuplicatedMove) {
            setErrorMessage(
                "同じポケモンに同じ技を複数登録することはできません。",
            );
            return;
        }

        const effortValueLimits = getEffortValueLimits();

        const effortValues = [
            toNumber(evH),
            toNumber(evA),
            toNumber(evB),
            toNumber(evC),
            toNumber(evD),
            toNumber(evS),
        ];

        const hasOverSingleLimit = effortValues.some(
            (value) => value > effortValueLimits.singleLimit,
        );

        if (
            hasOverSingleLimit ||
            effortValueTotal > effortValueLimits.totalLimit
        ) {
            setErrorMessage(
                `${effortValueLimits.label}では、努力値は1項目${effortValueLimits.singleLimit}まで、合計${effortValueLimits.totalLimit}までです。`,
            );
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
                ev_h: toNumber(evH),
                ev_a: toNumber(evA),
                ev_b: toNumber(evB),
                ev_c: toNumber(evC),
                ev_d: toNumber(evD),
                ev_s: toNumber(evS),
                move_1: move1,
                move_1_type: move1Type || undefined,
                move_2: move2,
                move_2_type: move2Type || undefined,
                move_3: move3,
                move_3_type: move3Type || undefined,
                move_4: move4,
                move_4_type: move4Type || undefined,
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

    const effortValueLimits = getEffortValueLimits();

    return (
        <>
            <AppHeader />

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
                            <p className="text-sm font-medium">
                                タイプで絞り込み
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                1つ選ぶと、そのタイプを含むポケモンを表示します。2つ選ぶと、その2タイプを両方持つポケモンを表示します。
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {pokemonTypes.map((type) => {
                                    const isSelected =
                                        selectedTypes.includes(type);

                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                handleToggleType(type)
                                            }
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
                                    選択中：
                                    {selectedPokemonMaster?.name || pokemonKey}
                                    {formKey !== "default" && ` / ${formKey}`}
                                </p>
                            )}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {filteredPokemonList.map((pokemon) => {
                                const isSelected =
                                    pokemon.key === pokemonKey &&
                                    pokemon.form_key === formKey;

                                const isAlreadyRegistered =
                                    isAlreadyRegisteredPokemon(pokemon);

                                return (
                                    <button
                                        key={`${pokemon.key}-${pokemon.form_key}`}
                                        type="button"
                                        disabled={isAlreadyRegistered}
                                        onClick={() => {
                                            if (isAlreadyRegistered) {
                                                return;
                                            }

                                            handleSelectPokemon(pokemon);
                                        }}
                                        className={`rounded border p-3 text-left transition disabled:cursor-not-allowed ${
                                            isAlreadyRegistered
                                                ? "bg-gray-100 opacity-50"
                                                : isSelected
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

                                                {isAlreadyRegistered && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        登録済み
                                                    </p>
                                                )}
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

                                <div className="mt-1">
                                    <BattleMasterTextSelector
                                        resource="item"
                                        value={item}
                                        onChangeText={setItem}
                                        onSelect={(option) =>
                                            setItem(option.name)
                                        }
                                        placeholder="持ち物名を検索"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    特性
                                </label>

                                <div className="mt-1">
                                    <BattleMasterTextSelector
                                        resource="ability"
                                        value={ability}
                                        onChangeText={setAbility}
                                        onSelect={(option) =>
                                            setAbility(option.name)
                                        }
                                        placeholder="特性名を検索"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    性格
                                </label>

                                <div className="mt-1">
                                    <NatureSelector
                                        value={nature}
                                        onChangeText={setNature}
                                        onSelect={(selectedNature) =>
                                            setNature(selectedNature.name)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="mt-4 rounded bg-gray-50 p-4 md:col-span-2">
                                <p className="text-sm font-medium">努力値</p>
                                <p
                                    className={`mt-1 text-xs ${
                                        effortValueTotal >
                                        effortValueLimits.totalLimit
                                            ? "text-red-600"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {effortValueLimits.label}：合計
                                    {effortValueTotal} /{" "}
                                    {effortValueLimits.totalLimit}、1項目{""}
                                    {effortValueLimits.singleLimit}まで
                                </p>

                                {effortValueTotal >
                                    effortValueLimits.totalLimit && (
                                    <p className="mt-1 text-xs text-red-600">
                                        合計努力値が上限を超えています。
                                    </p>
                                )}

                                <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-6">
                                    {[
                                        ["H", evH, setEvH],
                                        ["A", evA, setEvA],
                                        ["B", evB, setEvB],
                                        ["C", evC, setEvC],
                                        ["D", evD, setEvD],
                                        ["S", evS, setEvS],
                                    ].map(([label, value, setter]) => (
                                        <div key={label as string}>
                                            <label className="block text-xs font-medium">
                                                {label as string}
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                className="mt-1 w-full rounded border p-2"
                                                value={value as string}
                                                onChange={(event) => {
                                                    const nextValue =
                                                        event.target.value;

                                                    if (
                                                        !/^\d*$/.test(nextValue)
                                                    ) {
                                                        return;
                                                    }

                                                    if (
                                                        toNumber(nextValue) >
                                                        effortValueLimits.singleLimit
                                                    ) {
                                                        return;
                                                    }

                                                    (
                                                        setter as (
                                                            value: string,
                                                        ) => void
                                                    )(nextValue);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-xs text-gray-500">
                                    候補から技を選ぶと、攻撃技のタイプが自動設定されます。変化技は攻撃相性点に含まれません。
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    技1
                                </label>

                                <div className="mt-1">
                                    <MoveSelector
                                        value={move1}
                                        selectedMoveType={move1Type}
                                        onChangeText={(value) => {
                                            setMove1(value);
                                            setMove1Type("");
                                        }}
                                        onSelect={(move) => {
                                            setMove1(move.name);
                                            setMove1Type(
                                                move.is_scoring_target
                                                    ? move.type
                                                    : "",
                                            );
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    技2
                                </label>

                                <div className="mt-1">
                                    <MoveSelector
                                        value={move2}
                                        selectedMoveType={move2Type}
                                        onChangeText={(value) => {
                                            setMove2(value);
                                            setMove2Type("");
                                        }}
                                        onSelect={(move) => {
                                            setMove2(move.name);
                                            setMove2Type(
                                                move.is_scoring_target
                                                    ? move.type
                                                    : "",
                                            );
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    技3
                                </label>

                                <div className="mt-1">
                                    <MoveSelector
                                        value={move3}
                                        selectedMoveType={move3Type}
                                        onChangeText={(value) => {
                                            setMove3(value);
                                            setMove3Type("");
                                        }}
                                        onSelect={(move) => {
                                            setMove3(move.name);
                                            setMove3Type(
                                                move.is_scoring_target
                                                    ? move.type
                                                    : "",
                                            );
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    技4
                                </label>

                                <div className="mt-1">
                                    <MoveSelector
                                        value={move4}
                                        selectedMoveType={move4Type}
                                        onChangeText={(value) => {
                                            setMove4(value);
                                            setMove4Type("");
                                        }}
                                        onSelect={(move) => {
                                            setMove4(move.name);
                                            setMove4Type(
                                                move.is_scoring_target
                                                    ? move.type
                                                    : "",
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium">
                                メモ
                            </label>
                            <textarea
                                className="mt-1 w-full rounded border p-3"
                                value={memo}
                                onChange={(event) =>
                                    setMemo(event.target.value)
                                }
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
                                            onClick={() =>
                                                setActiveRoleTag(tag)
                                            }
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

                    {errorMessage && (
                        <p className="mt-6 rounded bg-red-100 p-3 text-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !pokemonKey}
                        className="rounded bg-black px-5 py-3 text-white disabled:opacity-50"
                    >
                        {isSubmitting ? "登録中..." : "ポケモンを登録する"}
                    </button>
                </form>

                {activeRoleTag && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                        onClick={() => setActiveRoleTag(null)}
                    >
                        <div
                            className="w-full max-w-lg rounded bg-white p-6 shadow-lg"
                            onClick={(event) => event.stopPropagation()}
                        >
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
                                                    <li key={example}>
                                                        {example}
                                                    </li>
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
                                    初手：{activeRoleTag.lead_score}点 /
                                    引き先：
                                    {activeRoleTag.switch_score}点 / 勝ち筋：
                                    {activeRoleTag.finisher_score}点
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
