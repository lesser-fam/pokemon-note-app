"use client";

import { AppHeader } from "@/components/AppHeader";
import { pokemonTypes } from "@/constants/pokemonTypes";
import { isMegaForm } from "@/features/battlePreview/utils/megaEvolution";
import {
    fetchNatureList,
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import { BattleMasterTextSelector } from "@/features/master/components/BattleMasterTextSelector";
import { MoveListEditor } from "@/features/partyPokemon/components/MoveListEditor";
import { NatureSelector } from "@/features/master/components/NatureSelector";
import { PokemonAbilitySelector } from "@/features/master/components/PokemonAbilitySelector";
import { RoleTagSelector } from "@/features/partyPokemon/components/RoleTagSelector";
import { fetchParty } from "@/features/parties/api/partyApi";
import {
    EffortValueEditor,
    type EffortValueStatKey,
} from "@/features/partyPokemon/components/EffortValueEditor";
import { createNewPartyVersion } from "@/features/partyVersions/api/partyVersionApi";
import type { NatureMaster } from "@/types/battleMaster";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";
import { toHiragana } from "@/utils/kana";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { FormEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

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

const effortValueFieldMap: Record<EffortValueStatKey, keyof EditablePokemon> = {
    h: "ev_h",
    a: "ev_a",
    b: "ev_b",
    c: "ev_c",
    d: "ev_d",
    s: "ev_s",
};

const moveFieldMap = [
    {
        name: "move_1",
        id: "move_1_id",
        type: "move_1_type",
    },
    {
        name: "move_2",
        id: "move_2_id",
        type: "move_2_type",
    },
    {
        name: "move_3",
        id: "move_3_id",
        type: "move_3_type",
    },
    {
        name: "move_4",
        id: "move_4_id",
        type: "move_4_type",
    },
] as const;

export default function CreatePartyVersionPage() {
    const router = useRouter();
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [roleTags, setRoleTags] = useState<RoleTag[]>([]);
    const [natureList, setNatureList] = useState<NatureMaster[]>([]);
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

    const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<
        number | null
    >(null);
    const [editingPokemonIndex, setEditingPokemonIndex] = useState<
        number | null
    >(null);

    const pokemonSearchSectionRef = useRef<HTMLDivElement | null>(null);
    const pokemonEditorSectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [partyData, pokemonData, roleTagData, natureDate] =
                    await Promise.all([
                        fetchParty(partyId),
                        fetchPokemonList(),
                        fetchRoleTags(),
                        fetchNatureList("", 100),
                    ]);

                setParty(partyData);
                setPokemonList(pokemonData);
                setRoleTags(roleTagData);
                setNatureList(natureDate);

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

    const findNatureMaster = (
        natureId: number | null,
    ): NatureMaster | undefined => {
        if (natureId === null) {
            return undefined;
        }

        return natureList.find((nature) => nature.id === natureId);
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

                if (!hasTag && pokemon.role_tag_ids.length >= 3) {
                    return pokemon;
                }

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

    const scrollToSection = (sectionRef: RefObject<HTMLDivElement | null>) => {
        window.requestAnimationFrame(() => {
            sectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    };

    const shiftIndexAfterRemoval = (
        currentIndex: number | null,
        removedIndex: number,
    ): number | null => {
        if (currentIndex === null) {
            return null;
        }

        if (currentIndex === removedIndex) {
            return null;
        }

        if (currentIndex > removedIndex) {
            return currentIndex - 1;
        }

        return currentIndex;
    };

    const handleStartReplacingSelectedPokemon = () => {
        if (selectedPokemonIndex === null) {
            return;
        }

        setReplaceTargetIndex(selectedPokemonIndex);

        setEditingPokemonIndex(null);
        setSearchKeyword("");
        setSelectedTypes([]);

        scrollToSection(pokemonSearchSectionRef);
    };

    const handleRemoveSelectedPokemon = () => {
        if (selectedPokemonIndex === null) {
            return;
        }

        const removedIndex = selectedPokemonIndex;

        setEditablePokemonList((currentList) =>
            currentList.filter(
                (_, currentIndex) => currentIndex !== removedIndex,
            ),
        );

        setSelectedPokemonIndex(null);

        setEditingPokemonIndex((currentIndex) =>
            shiftIndexAfterRemoval(currentIndex, removedIndex),
        );

        setReplaceTargetIndex((currentIndex) =>
            shiftIndexAfterRemoval(currentIndex, removedIndex),
        );
    };

    const handleAddPokemon = (pokemon: Pokemon) => {
        if (editablePokemonList.length >= 6) {
            return;
        }

        const addedIndex = editablePokemonList.length;

        setEditablePokemonList((currentList) => [
            ...currentList,
            createEditablePokemon(pokemon),
        ]);

        setSelectedPokemonIndex(addedIndex);
        setEditingPokemonIndex(null);
    };

    const handleReplacePokemon = (pokemon: Pokemon) => {
        if (replaceTargetIndex === null) {
            return;
        }

        const replacedIndex = replaceTargetIndex;

        setEditablePokemonList((currentList) =>
            currentList.map((currentPokemon, currentIndex) =>
                currentIndex === replacedIndex
                    ? createEditablePokemon(pokemon)
                    : currentPokemon,
            ),
        );

        setReplaceTargetIndex(null);
        setSelectedPokemonIndex(replacedIndex);
        setEditingPokemonIndex(null);
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

        const isSelectableForm = !isMegaForm(pokemon);

        return isSelectableForm && matchesKeyword && matchesTypes;
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

    const handleSelectPokemonCard = (index: number) => {
        setSelectedPokemonIndex((currentIndex) =>
            currentIndex === index ? null : index,
        );
    };

    const handleStartEditingSelectedPokemon = () => {
        if (selectedPokemonIndex === null) {
            return;
        }

        setEditingPokemonIndex(selectedPokemonIndex);

        scrollToSection(pokemonEditorSectionRef);
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
                <main className="mx-auto w-full max-w-7xl p-6">
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
                <main className="mx-auto w-full max-w-7xl p-6">
                    <p>読み込み中...</p>
                </main>
            </>
        );
    }

    if (!party) {
        return (
            <>
                <AppHeader />
                <main className="mx-auto w-full max-w-7xl p-6">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        パーティが見つかりません。
                    </p>
                </main>
            </>
        );
    }

    const effortValueLimits = getEffortValueLimits();

    const editingPokemon =
        editingPokemonIndex !== null
            ? editablePokemonList[editingPokemonIndex]
            : null;

    const editingPokemonMaster = editingPokemon
        ? findPokemonMaster(editingPokemon.pokemon_key, editingPokemon.form_key)
        : undefined;

    const editingNatureMaster = editingPokemon
        ? findNatureMaster(editingPokemon.nature_id)
        : undefined;

    return (
        <>
            <AppHeader />

            <main className="mx-auto w-full max-w-7xl p-6">
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

                <form onSubmit={handleSubmit} className="mt-8 w-full space-y-8">
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

                    <section className="w-full rounded border p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-lg font-bold">
                                        新しい6匹
                                    </h2>

                                    <p className="text-sm font-medium text-gray-600">
                                        {editablePokemonList.length} / 6
                                    </p>
                                </div>

                                <p className="mt-1 text-sm text-gray-600">
                                    操作するポケモンを選択してください。
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    disabled={selectedPokemonIndex === null}
                                    onClick={handleStartEditingSelectedPokemon}
                                    className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    型・技情報を編集
                                </button>

                                <button
                                    type="button"
                                    disabled={selectedPokemonIndex === null}
                                    onClick={
                                        handleStartReplacingSelectedPokemon
                                    }
                                    className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    入れ替え
                                </button>

                                <button
                                    type="button"
                                    disabled={selectedPokemonIndex === null}
                                    onClick={handleRemoveSelectedPokemon}
                                    className="rounded border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    外す
                                </button>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                            {editablePokemonList.map((pokemon, index) => {
                                const pokemonMaster = findPokemonMaster(
                                    pokemon.pokemon_key,
                                    pokemon.form_key,
                                );

                                const isSelected =
                                    selectedPokemonIndex === index;

                                return (
                                    <button
                                        key={`${pokemon.pokemon_key}-${pokemon.form_key}-${index}`}
                                        type="button"
                                        onClick={() =>
                                            handleSelectPokemonCard(index)
                                        }
                                        className={`rounded border p-3 text-left transition ${
                                            isSelected
                                                ? "border-black bg-gray-100 ring-2 ring-black"
                                                : "bg-white hover:bg-gray-50"
                                        }`}
                                    >
                                        <p className="text-xs text-gray-400">
                                            {index + 1}匹目
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">
                                            {pokemonMaster?.image_url ? (
                                                <img
                                                    src={
                                                        pokemonMaster.image_url
                                                    }
                                                    alt={pokemonMaster.name}
                                                    className="h-12 w-12 shrink-0 object-contain"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-100 text-xs">
                                                    ?
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold">
                                                    {pokemonMaster?.name ||
                                                        pokemon.pokemon_key}
                                                </p>

                                                {pokemonMaster && (
                                                    <p className="mt-0.5 truncate text-[11px] text-gray-600">
                                                        {pokemonMaster.types.join(
                                                            " / ",
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {editingPokemon && editingPokemonIndex !== null && (
                            <div
                                ref={pokemonEditorSectionRef}
                                className="mt-5 w-full min-w-0 scroll-mt-4 rounded border bg-gray-50 p-5"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold">
                                            {editingPokemonMaster?.name ||
                                                editingPokemon.pokemon_key}
                                            の型・技情報
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            登録済みの内容を編集できます。
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingPokemonIndex(null)
                                        }
                                        className="text-sm text-blue-600"
                                    >
                                        編集欄を閉じる
                                    </button>
                                </div>

                                <div className="mt-4 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,17rem)_8rem_minmax(0,22rem)_minmax(0,1fr)]">
                                    <div className="min-w-0 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium">
                                                ニックネーム・表示名
                                            </label>

                                            <input
                                                className="mt-1 w-full rounded border px-3 py-2"
                                                value={editingPokemon.nickname}
                                                onChange={(event) =>
                                                    updatePokemon(
                                                        editingPokemonIndex,
                                                        "nickname",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="空欄ならポケモン名で表示"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium">
                                                特性
                                            </label>

                                            <div className="mt-2">
                                                <PokemonAbilitySelector
                                                    pokemonKey={
                                                        editingPokemon.pokemon_key
                                                    }
                                                    formKey={
                                                        editingPokemon.form_key
                                                    }
                                                    selectedAbilityId={
                                                        editingPokemon.ability_id
                                                    }
                                                    onSelect={(
                                                        selectedAbility,
                                                    ) => {
                                                        updatePokemon(
                                                            editingPokemonIndex,
                                                            "ability",
                                                            selectedAbility.name,
                                                        );

                                                        updatePokemon(
                                                            editingPokemonIndex,
                                                            "ability_id",
                                                            selectedAbility.id,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium">
                                                持ち物
                                            </label>

                                            <div className="mt-1">
                                                <BattleMasterTextSelector
                                                    resource="item"
                                                    value={editingPokemon.item}
                                                    onChangeText={(value) => {
                                                        updatePokemon(
                                                            editingPokemonIndex,
                                                            "item",
                                                            value,
                                                        );

                                                        updatePokemon(
                                                            editingPokemonIndex,
                                                            "item_id",
                                                            null,
                                                        );
                                                    }}
                                                    onSelect={(option) => {
                                                        updatePokemon(
                                                            editingPokemonIndex,
                                                            "item",
                                                            option.name,
                                                        );

                                                        updatePokemon(
                                                            editingPokemonIndex,
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
                                                性格
                                            </label>

                                            <div className="mt-1">
                                                <NatureSelector
                                                    value={
                                                        editingPokemon.nature
                                                    }
                                                    selectedNatureId={
                                                        editingPokemon.nature_id
                                                    }
                                                    onChangeText={(value) => {
                                                        updatePokemon(
                                                            editingPokemonIndex,
                                                            "nature",
                                                            value,
                                                        );

                                                        updatePokemon(
                                                            editingPokemonIndex,
                                                            "nature_id",
                                                            null,
                                                        );
                                                    }}
                                                    onSelect={(
                                                        selectedNature,
                                                    ) => {
                                                        updatePokemon(
                                                            editingPokemonIndex,
                                                            "nature",
                                                            selectedNature.name,
                                                        );

                                                        updatePokemon(
                                                            editingPokemonIndex,
                                                            "nature_id",
                                                            selectedNature.id,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <EffortValueEditor
                                        values={{
                                            h: editingPokemon.ev_h,
                                            a: editingPokemon.ev_a,
                                            b: editingPokemon.ev_b,
                                            c: editingPokemon.ev_c,
                                            d: editingPokemon.ev_d,
                                            s: editingPokemon.ev_s,
                                        }}
                                        limits={effortValueLimits}
                                        nature={editingNatureMaster}
                                        onChange={(statKey, value) => {
                                            updatePokemon(
                                                editingPokemonIndex,
                                                effortValueFieldMap[statKey],
                                                Number(value || 0),
                                            );
                                        }}
                                    />

                                    <MoveListEditor
                                        moves={[
                                            {
                                                name: editingPokemon.move_1,
                                                id: editingPokemon.move_1_id,
                                                type: editingPokemon.move_1_type,
                                            },
                                            {
                                                name: editingPokemon.move_2,
                                                id: editingPokemon.move_2_id,
                                                type: editingPokemon.move_2_type,
                                            },
                                            {
                                                name: editingPokemon.move_3,
                                                id: editingPokemon.move_3_id,
                                                type: editingPokemon.move_3_type,
                                            },
                                            {
                                                name: editingPokemon.move_4,
                                                id: editingPokemon.move_4_id,
                                                type: editingPokemon.move_4_type,
                                            },
                                        ]}
                                        onChange={(moveIndex, move) => {
                                            const fields =
                                                moveFieldMap[moveIndex];

                                            if (!fields) {
                                                return;
                                            }

                                            updatePokemon(
                                                editingPokemonIndex,
                                                fields.name,
                                                move.name,
                                            );

                                            updatePokemon(
                                                editingPokemonIndex,
                                                fields.id,
                                                move.id,
                                            );

                                            updatePokemon(
                                                editingPokemonIndex,
                                                fields.type,
                                                move.type,
                                            );
                                        }}
                                    />

                                    <div className="min-w-0">
                                        <label className="block text-sm font-medium">
                                            メモ
                                        </label>

                                        <textarea
                                            className="mt-1 min-h-40 w-full rounded border p-3"
                                            value={editingPokemon.memo}
                                            onChange={(event) =>
                                                updatePokemon(
                                                    editingPokemonIndex,
                                                    "memo",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="型の意図、選出時の注意点など"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 border-t pt-4">
                                    <RoleTagSelector
                                        roleTags={roleTags}
                                        selectedRoleTagIds={
                                            editingPokemon.role_tag_ids
                                        }
                                        onToggle={(roleTagId) =>
                                            toggleRoleTag(
                                                editingPokemonIndex,
                                                roleTagId,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        <div
                            ref={pokemonSearchSectionRef}
                            className="mt-8 scroll-mt-4 rounded bg-gray-50 p-4"
                        >
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
                                    すでに6匹そろっています。入れ替えたいポケモンを選択し、
                                    「入れ替え」ボタンを押してください。
                                </p>
                            ) : (
                                <>
                                    <div className="mt-4 grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
                                        <div className="rounded bg-white p-4">
                                            <label className="block text-sm font-medium">
                                                ポケモン名で検索
                                            </label>

                                            <p className="mt-1 text-xs text-gray-500">
                                                メガシンカは対戦前選出画面で一時的に切り替えます。
                                            </p>

                                            <input
                                                className="mt-2 w-full rounded border px-3 py-2"
                                                value={searchKeyword}
                                                onChange={(event) =>
                                                    setSearchKeyword(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="例：リザードン、りざ、ガブ"
                                            />

                                            <div className="mt-4">
                                                <p className="text-sm font-medium">
                                                    タイプで絞り込み
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    2つ選ぶと、両方のタイプを持つポケモンを表示します。
                                                </p>

                                                <div className="mt-2 grid grid-cols-6 gap-1">
                                                    {pokemonTypes.map(
                                                        (type) => {
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
                                                                    className={`whitespace-nowrap rounded-full border px-0.5 py-1 text-[9px] leading-none ${
                                                                        isSelected
                                                                            ? "border-black bg-black text-white"
                                                                            : "hover:bg-gray-50"
                                                                    }`}
                                                                >
                                                                    {type}
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>

                                                {selectedTypes.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedTypes([])
                                                        }
                                                        className="mt-2 text-xs text-blue-600"
                                                    >
                                                        タイプ絞り込みを解除
                                                    </button>
                                                )}
                                            </div>

                                            <p className="mt-4 text-xs text-gray-500">
                                                候補：
                                                {filteredPokemonList.length}件
                                                {!hasPokemonFilter &&
                                                    filteredPokemonList.length >
                                                        visiblePokemonList.length &&
                                                    ` / 初期表示 ${visiblePokemonList.length}件`}
                                            </p>

                                            {!hasPokemonFilter &&
                                                filteredPokemonList.length && (
                                                    <p className="mt-1 text-[10px] text-gray-400">
                                                        名前またはタイプで絞り込むと、ほかの候補も表示されます。
                                                    </p>
                                                )}
                                        </div>

                                        <div className="max-h-112 overflow-y-auto rounded border bg-white p-3">
                                            <div className="grid gap-3 sm:grid-cols-2">
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

                                                                    <div className="min-w-0">
                                                                        <p className="truncate font-bold">
                                                                            {
                                                                                pokemon.name
                                                                            }
                                                                        </p>

                                                                        <p className="text-xs text-gray-600">
                                                                            {
                                                                                pokemon.kana
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-gray-600">
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
                                            <p className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
                                                条件に合うポケモンが見つかりません。
                                            </p>
                                        )}
                                    </div>
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
