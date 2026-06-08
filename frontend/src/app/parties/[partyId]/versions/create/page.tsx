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
import { PokemonAbilitySelector } from "@/features/master/components/PokemonAbilitySelector";
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
    item_id: number | null;

    ability: string;
    ability_id: number | null;

    nature: string;
    nature_id: number | null;

    ev_h: number;
    ev_a: number;
    ev_b: number;
    ev_c: number;
    ev_d: number;
    ev_s: number;

    move_1: string;
    move_1_id: number | null;
    move_1_type: string;

    move_2: string;
    move_2_id: number | null;
    move_2_type: string;

    move_3: string;
    move_3_id: number | null;
    move_3_type: string;

    move_4: string;
    move_4_id: number | null;
    move_4_type: string;

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
                        item_id: pokemon.item_id ?? null,

                        ability: pokemon.ability ?? "",
                        ability_id: pokemon.ability_id ?? null,

                        nature: pokemon.nature ?? "",
                        nature_id: pokemon.nature_id ?? null,

                        ev_h: pokemon.ev_h ?? 0,
                        ev_a: pokemon.ev_a ?? 0,
                        ev_b: pokemon.ev_b ?? 0,
                        ev_c: pokemon.ev_c ?? 0,
                        ev_d: pokemon.ev_d ?? 0,
                        ev_s: pokemon.ev_s ?? 0,

                        move_1: pokemon.move_1 ?? "",
                        move_1_id: pokemon.move_1_id ?? null,
                        move_1_type: pokemon.move_1_type ?? "",

                        move_2: pokemon.move_2 ?? "",
                        move_2_id: pokemon.move_2_id ?? null,
                        move_2_type: pokemon.move_2_type ?? "",

                        move_3: pokemon.move_3 ?? "",
                        move_3_id: pokemon.move_3_id ?? null,
                        move_3_type: pokemon.move_3_type ?? "",

                        move_4: pokemon.move_4 ?? "",
                        move_4_id: pokemon.move_4_id ?? null,
                        move_4_type: pokemon.move_4_type ?? "",

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
        value: string | number | number[] | null,
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
            item_id: null,

            ability: "",
            ability_id: null,

            nature: "",
            nature_id: null,

            ev_h: 0,
            ev_a: 0,
            ev_b: 0,
            ev_c: 0,
            ev_d: 0,
            ev_s: 0,

            move_1: "",
            move_1_id: null,
            move_1_type: "",

            move_2: "",
            move_2_id: null,
            move_2_type: "",

            move_3: "",
            move_3_id: null,
            move_3_type: "",

            move_4: "",
            move_4_id: null,
            move_4_type: "",

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
                editablePokemon.pokemon_key === pokemon.key,
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

    const hasPokemonFilter =
        normalizedKeyword !== "" || selectedTypes.length > 0;

    const visiblePokemonList = hasPokemonFilter
        ? filteredPokemonList
        : filteredPokemonList.slice(0, 30);

    const calculateEffortValueTotal = (pokemon: EditablePokemon) => {
        return (
            pokemon.ev_h +
            pokemon.ev_a +
            pokemon.ev_b +
            pokemon.ev_c +
            pokemon.ev_d +
            pokemon.ev_s
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

        const hasUnselectedMasterData = editablePokemonList.some((pokemon) => {
            if (pokemon.item.trim() !== "" && pokemon.item_id === null) {
                return true;
            }

            if (pokemon.ability.trim() !== "" && pokemon.ability_id === null) {
                return true;
            }

            if (pokemon.nature.trim() !== "" && pokemon.nature_id === null) {
                return true;
            }

            const moves = [
                { name: pokemon.move_1, id: pokemon.move_1_id },
                { name: pokemon.move_2, id: pokemon.move_2_id },
                { name: pokemon.move_3, id: pokemon.move_3_id },
                { name: pokemon.move_4, id: pokemon.move_4_id },
            ];

            return moves.some(
                (move) => move.name.trim() !== "" && move.id === null,
            );
        });

        if (hasUnselectedMasterData) {
            setErrorMessage(
                "持ち物、特性、性格、技は検索候補から選択してください。",
            );
            return;
        }

        const pokemonKeys = editablePokemonList.map(
            (pokemon) => pokemon.pokemon_key,
        );

        const hasDuplicatedPokemon =
            new Set(pokemonKeys).size !== pokemonKeys.length;

        if (hasDuplicatedPokemon) {
            setErrorMessage(
                "同じ種類のポケモンは、フォーム違いを含めて同じパーティに登録できません。",
            );
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

        const hasDuplicatedMove = editablePokemonList.some((pokemon) => {
            const moves = [
                pokemon.move_1,
                pokemon.move_2,
                pokemon.move_3,
                pokemon.move_4,
            ]
                .map((move) => move.trim())
                .filter((move) => move !== "");

            return new Set(moves).size !== moves.length;
        });

        if (hasDuplicatedMove) {
            setErrorMessage(
                "同じポケモンに同じ技を複数登録することはできません。",
            );
            return;
        }

        const effortValueLimits = getEffortValueLimits();

        const invalidEffortValuePokemon = editablePokemonList.find(
            (pokemon) => {
                const effortValues = [
                    pokemon.ev_h,
                    pokemon.ev_a,
                    pokemon.ev_b,
                    pokemon.ev_c,
                    pokemon.ev_d,
                    pokemon.ev_s,
                ];

                const hasOverSingleLimit = effortValues.some(
                    (value) => value > effortValueLimits.singleLimit,
                );

                const total = calculateEffortValueTotal(pokemon);

                return (
                    hasOverSingleLimit || total > effortValueLimits.totalLimit
                );
            },
        );

        if (invalidEffortValuePokemon) {
            setErrorMessage(
                `${effortValueLimits.label}では、努力値は1項目${effortValueLimits.singleLimit}まで、合計${effortValueLimits.totalLimit}までです。`,
            );
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

    const effortValueLimits = getEffortValueLimits();

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

                                                <div className="mt-1">
                                                    <BattleMasterTextSelector
                                                        resource="item"
                                                        value={pokemon.item}
                                                        onChangeText={(
                                                            value,
                                                        ) => {
                                                            updatePokemon(
                                                                index,
                                                                "item",
                                                                value,
                                                            );
                                                            updatePokemon(
                                                                index,
                                                                "item_id",
                                                                null,
                                                            );
                                                        }}
                                                        onSelect={(option) => {
                                                            updatePokemon(
                                                                index,
                                                                "item",
                                                                option.name,
                                                            );
                                                            updatePokemon(
                                                                index,
                                                                "item_id",
                                                                option.id,
                                                            );
                                                        }}
                                                        placeholder="持ち物名を検索"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">
                                                    特性
                                                </label>

                                                <div className="mt-2">
                                                    <PokemonAbilitySelector
                                                        pokemonKey={
                                                            pokemon.pokemon_key
                                                        }
                                                        formKey={
                                                            pokemon.form_key
                                                        }
                                                        selectedAbilityId={
                                                            pokemon.ability_id
                                                        }
                                                        onSelect={(
                                                            selectedAbility,
                                                        ) => {
                                                            updatePokemon(
                                                                index,
                                                                "ability",
                                                                selectedAbility.name,
                                                            );

                                                            updatePokemon(
                                                                index,
                                                                "ability_id",
                                                                selectedAbility.id,
                                                            );
                                                        }}
                                                    />
                                                </div>

                                                {pokemon.ability && (
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        選択中：
                                                        {pokemon.ability}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">
                                                    性格
                                                </label>

                                                <div className="mt-1">
                                                    <NatureSelector
                                                        value={pokemon.nature}
                                                        onChangeText={(
                                                            value,
                                                        ) => {
                                                            updatePokemon(
                                                                index,
                                                                "nature",
                                                                value,
                                                            );
                                                            updatePokemon(
                                                                index,
                                                                "nature_id",
                                                                null,
                                                            );
                                                        }}
                                                        onSelect={(
                                                            selectedNature,
                                                        ) => {
                                                            updatePokemon(
                                                                index,
                                                                "nature",
                                                                selectedNature.name,
                                                            );
                                                            updatePokemon(
                                                                index,
                                                                "nature_id",
                                                                selectedNature.id,
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded bg-gray-50 p-4 md:col-span-2">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            努力値
                                                        </p>
                                                        <p
                                                            className={`mt-1 text-xs ${
                                                                calculateEffortValueTotal(
                                                                    pokemon,
                                                                ) >
                                                                effortValueLimits.totalLimit
                                                                    ? "text-red-600"
                                                                    : "text-gray-500"
                                                            }`}
                                                        >
                                                            {
                                                                effortValueLimits.label
                                                            }
                                                            ：合計
                                                            {calculateEffortValueTotal(
                                                                pokemon,
                                                            )}
                                                            /{" "}
                                                            {
                                                                effortValueLimits.totalLimit
                                                            }
                                                            、1項目
                                                            {
                                                                effortValueLimits.singleLimit
                                                            }
                                                            まで
                                                        </p>

                                                        {calculateEffortValueTotal(
                                                            pokemon,
                                                        ) >
                                                            effortValueLimits.totalLimit && (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                合計努力値が上限を超えています。
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-6">
                                                    {[
                                                        ["ev_h", "H"],
                                                        ["ev_a", "A"],
                                                        ["ev_b", "B"],
                                                        ["ev_c", "C"],
                                                        ["ev_d", "D"],
                                                        ["ev_s", "S"],
                                                    ].map(([field, label]) => (
                                                        <div key={field}>
                                                            <label className="block text-xs font-medium">
                                                                {label}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                className="mt-1 w-full rounded border p-2"
                                                                value={String(
                                                                    pokemon[
                                                                        field as keyof EditablePokemon
                                                                    ] ?? "",
                                                                )}
                                                                onChange={(
                                                                    event,
                                                                ) => {
                                                                    const nextValue =
                                                                        event
                                                                            .target
                                                                            .value;

                                                                    if (
                                                                        !/^\d*$/.test(
                                                                            nextValue,
                                                                        )
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    if (
                                                                        Number(
                                                                            nextValue ||
                                                                                0,
                                                                        ) >
                                                                        effortValueLimits.singleLimit
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    updatePokemon(
                                                                        index,
                                                                        field as keyof EditablePokemon,
                                                                        Number(
                                                                            nextValue ||
                                                                                0,
                                                                        ),
                                                                    );
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

                                            {(
                                                [
                                                    [
                                                        "move_1",
                                                        "move_1_id",
                                                        "move_1_type",
                                                    ],
                                                    [
                                                        "move_2",
                                                        "move_2_id",
                                                        "move_2_type",
                                                    ],
                                                    [
                                                        "move_3",
                                                        "move_3_id",
                                                        "move_3_type",
                                                    ],
                                                    [
                                                        "move_4",
                                                        "move_4_id",
                                                        "move_4_type",
                                                    ],
                                                ] as const
                                            ).map(
                                                (
                                                    [
                                                        moveField,
                                                        moveIdField,
                                                        moveTypeField,
                                                    ],
                                                    moveIndex,
                                                ) => (
                                                    <div key={moveField}>
                                                        <label className="block text-sm font-medium">
                                                            技{moveIndex + 1}
                                                        </label>

                                                        <div className="mt-1">
                                                            <MoveSelector
                                                                value={
                                                                    pokemon[
                                                                        moveField
                                                                    ]
                                                                }
                                                                selectedMoveType={
                                                                    pokemon[
                                                                        moveTypeField
                                                                    ]
                                                                }
                                                                onChangeText={(
                                                                    value,
                                                                ) => {
                                                                    updatePokemon(
                                                                        index,
                                                                        moveField,
                                                                        value,
                                                                    );
                                                                    updatePokemon(
                                                                        index,
                                                                        moveIdField,
                                                                        null,
                                                                    );
                                                                    updatePokemon(
                                                                        index,
                                                                        moveTypeField,
                                                                        "",
                                                                    );
                                                                }}
                                                                onSelect={(
                                                                    move,
                                                                ) => {
                                                                    updatePokemon(
                                                                        index,
                                                                        moveField,
                                                                        move.name,
                                                                    );
                                                                    updatePokemon(
                                                                        index,
                                                                        moveIdField,
                                                                        move.id,
                                                                    );
                                                                    updatePokemon(
                                                                        index,
                                                                        moveTypeField,
                                                                        move.is_scoring_target
                                                                            ? move.type
                                                                            : "",
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
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
                                            {!hasPokemonFilter &&
                                                filteredPokemonList.length >
                                                    visiblePokemonList.length &&
                                                `初期表示 ${visiblePokemonList.length}件`}
                                        </p>

                                        {!hasPokemonFilter &&
                                            filteredPokemonList.length >
                                                visiblePokemonList.length && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    ポケモン名の検索またはタイプ絞り込みで候補を探してください。
                                                </p>
                                            )}
                                    </div>

                                    <div className="mt-4 max-h-128 overflow-y-auto rounded border bg-gray-50 p-3">
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                            {visiblePokemonList.map(
                                                (pokemon) => {
                                                    const isSelected =
                                                        isAlreadySelectedPokemon(
                                                            pokemon,
                                                        );

                                                    return (
                                                        <button
                                                            key={`${pokemon.key}-${pokemon.form_key}`}
                                                            type="button"
                                                            disabled={
                                                                isSelected
                                                            }
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
                                                                        {
                                                                            pokemon.name
                                                                        }
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
                                                },
                                            )}
                                        </div>
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
