"use client";

import { AppHeader } from "@/components/AppHeader";
import { pokemonTypes } from "@/constants/pokemonTypes";
import { isMegaForm } from "@/features/battlePreview/utils/megaEvolution";
import {
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import { BattleMasterTextSelector } from "@/features/master/components/BattleMasterTextSelector";
import { EffortValueEditor } from "@/features/partyPokemon/components/EffortValueEditor";
import { MoveListEditor } from "@/features/partyPokemon/components/MoveListEditor";
import { NatureSelector } from "@/features/master/components/NatureSelector";
import { PokemonAbilitySelector } from "@/features/master/components/PokemonAbilitySelector";
import { fetchParty } from "@/features/parties/api/partyApi";
import { createPartyPokemon } from "@/features/partyPokemon/api/partyPokemonApi";
import type { NatureMaster } from "@/types/battleMaster";
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
    const [itemId, setItemId] = useState<number | null>(null);

    const [ability, setAbility] = useState("");
    const [abilityId, setAbilityId] = useState<number | null>(null);

    const [nature, setNature] = useState("");
    const [natureId, setNatureId] = useState<number | null>(null);
    const [selectedNatureMaster, setSelectedNatureMaster] =
        useState<NatureMaster | null>(null);

    const [evH, setEvH] = useState("0");
    const [evA, setEvA] = useState("0");
    const [evB, setEvB] = useState("0");
    const [evC, setEvC] = useState("0");
    const [evD, setEvD] = useState("0");
    const [evS, setEvS] = useState("0");

    const [move1, setMove1] = useState("");
    const [move1Id, setMove1Id] = useState<number | null>(null);
    const [move1Type, setMove1Type] = useState("");

    const [move2, setMove2] = useState("");
    const [move2Id, setMove2Id] = useState<number | null>(null);
    const [move2Type, setMove2Type] = useState("");

    const [move3, setMove3] = useState("");
    const [move3Id, setMove3Id] = useState<number | null>(null);
    const [move3Type, setMove3Type] = useState("");

    const [move4, setMove4] = useState("");
    const [move4Id, setMove4Id] = useState<number | null>(null);
    const [move4Type, setMove4Type] = useState("");

    const [memo, setMemo] = useState("");
    const [selectedRoleTagIds, setSelectedRoleTagIds] = useState<number[]>([]);

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
            <main className="mx-auto max-w-7xl p-6">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    パーティIDが正しくありません。
                </p>
            </main>
        );
    }

    const handleSelectPokemon = (pokemon: Pokemon) => {
        setPokemonKey(pokemon.key);
        setFormKey(pokemon.form_key);

        setAbility("");
        setAbilityId(null);
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

            if (currentIds.length >= 3) {
                return currentIds;
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

        const isSelectableForm = !isMegaForm(pokemon);

        return isSelectableForm && matchesKeyword && matchesTypes;
    });

    const hasPokemonFilter =
        normalizedKeyword !== "" || selectedTypes.length > 0;

    const visiblePokemonList = hasPokemonFilter
        ? filteredPokemonList
        : filteredPokemonList.slice(0, 30);

    const selectedPokemonMaster = pokemonList.find(
        (pokemon) => pokemon.key === pokemonKey && pokemon.form_key === formKey,
    );

    const currentPokemonList = party?.current_version?.pokemon ?? [];

    const isAlreadyRegisteredPokemon = (pokemon: Pokemon) => {
        return currentPokemonList.some(
            (partyPokemon) => partyPokemon.pokemon_key === pokemon.key,
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

        if (item.trim() !== "" && itemId === null) {
            setErrorMessage("持ち物は検索候補から選択してください。");
            return;
        }

        if (ability.trim() !== "" && abilityId === null) {
            setErrorMessage("特性は検索候補から選択してください。");
            return;
        }

        if (nature.trim() !== "" && natureId === null) {
            setErrorMessage("性格は検索候補から選択してください。");
            return;
        }

        const moveEntries = [
            { name: move1, id: move1Id },
            { name: move2, id: move2Id },
            { name: move3, id: move3Id },
            { name: move4, id: move4Id },
        ];

        const hasUnselectedMove = moveEntries.some(
            (move) => move.name.trim() !== "" && move.id === null,
        );

        if (hasUnselectedMove) {
            setErrorMessage("技は検索候補から選択してください。");
            return;
        }

        const isDuplicatedPokemon = currentPokemonList.some(
            (partyPokemon) => partyPokemon.pokemon_key === pokemonKey,
        );

        if (isDuplicatedPokemon) {
            setErrorMessage(
                "同じ種類のポケモンは、フォーム違いを含めて同じパーティに登録できません。",
            );
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
                item_id: itemId,

                ability,
                ability_id: abilityId,

                nature,
                nature_id: natureId,

                ev_h: toNumber(evH),
                ev_a: toNumber(evA),
                ev_b: toNumber(evB),
                ev_c: toNumber(evC),
                ev_d: toNumber(evD),
                ev_s: toNumber(evS),

                move_1: move1,
                move_1_id: move1Id,
                move_1_type: move1Type || undefined,

                move_2: move2,
                move_2_id: move2Id,
                move_2_type: move2Type || undefined,

                move_3: move3,
                move_3_id: move3Id,
                move_3_type: move3Type || undefined,

                move_4: move4,
                move_4_id: move4Id,
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

                <main className="mx-auto max-w-7xl p-6">
                    <p>読み込み中...</p>
                </main>
            </>
        );
    }

    if (!party) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-7xl p-6">
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

            <main className="mx-auto max-w-7xl p-6">
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
                    <section className="rounded border bg-white p-5">
                        <h2 className="text-lg font-bold">ポケモン選択</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            名前・かな・タイプから登録するポケモンを探せます。
                        </p>

                        <div className="mt-4 grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
                            <div>
                                <div>
                                    <label className="block text-sm font-medium">
                                        ポケモン名で検索
                                    </label>

                                    <input
                                        className="mt-1 w-full rounded border px-3 py-2"
                                        value={searchKeyword}
                                        onChange={(event) =>
                                            setSearchKeyword(event.target.value)
                                        }
                                        placeholder="例：リザードン、りざ、ガブ"
                                    />
                                </div>

                                <div className="mt-4">
                                    <p className="text-sm font-medium">
                                        タイプで絞り込み
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        2つ選ぶと、両方のタイプを持つポケモンを表示します。
                                    </p>

                                    <div className="mt-2 grid grid-cols-6 gap-1">
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
                                                    className={`whitespace-nowrap rounded-full border px-0.5 py-1 text-[9px] leading-none ${
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
                                        filteredPokemonList.length && (
                                            <p className="mt-1 text-[10px] text-gray-400">
                                                名前またはタイプで絞り込むと、ほかの候補も表示されます。
                                            </p>
                                        )}

                                    {pokemonKey ? (
                                        <p className="mt-1 text-sm font-medium">
                                            選択中：
                                            {selectedPokemonMaster?.name ||
                                                pokemonKey}
                                        </p>
                                    ) : (
                                        <p className="mt-1 text-sm text-gray-500">
                                            ポケモンを選択してください。
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="max-h-112 overflow-y-auto rounded border bg-gray-50 p-3">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {visiblePokemonList.map((pokemon) => {
                                            const isSelected =
                                                pokemon.key === pokemonKey &&
                                                pokemon.form_key === formKey;

                                            const isAlreadyRegistered =
                                                isAlreadyRegisteredPokemon(
                                                    pokemon,
                                                );

                                            return (
                                                <button
                                                    key={`${pokemon.key}-${pokemon.form_key}`}
                                                    type="button"
                                                    disabled={
                                                        isAlreadyRegistered
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            isAlreadyRegistered
                                                        ) {
                                                            return;
                                                        }

                                                        handleSelectPokemon(
                                                            pokemon,
                                                        );
                                                    }}
                                                    className={`rounded border bg-white p-3 text-left transition disabled:cursor-not-allowed ${
                                                        isAlreadyRegistered
                                                            ? "opacity-50"
                                                            : isSelected
                                                              ? "border-black bg-gray-100 ring-2 ring-black"
                                                              : "hover:bg-gray-50"
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
                                                                {pokemon.name}
                                                            </p>

                                                            <p className="text-xs text-gray-600">
                                                                {pokemon.kana}
                                                            </p>

                                                            <p className="mt-1 text-xs">
                                                                {pokemon.types.join(
                                                                    " / ",
                                                                )}
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
                                </div>

                                {filteredPokemonList.length === 0 && (
                                    <p className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
                                        条件に合うポケモンが見つかりません。
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded border bg-white p-5">
                        <h2 className="text-lg font-bold">型・技情報</h2>

                        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,17rem)_7rem_minmax(0,20rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,18rem)_8rem_minmax(0,22rem)_minmax(0,1fr)]">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">
                                        ニックネーム・表示名
                                    </label>

                                    <input
                                        className="mt-1 w-full rounded border px-3 py-2"
                                        value={nickname}
                                        onChange={(event) =>
                                            setNickname(event.target.value)
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
                                            pokemonKey={pokemonKey}
                                            formKey={formKey}
                                            selectedAbilityId={abilityId}
                                            onSelect={(selectedAbility) => {
                                                setAbility(
                                                    selectedAbility.name,
                                                );

                                                setAbilityId(
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
                                            value={item}
                                            onChangeText={(value) => {
                                                setItem(value);
                                                setItemId(null);
                                            }}
                                            onSelect={(option) => {
                                                setItem(option.name);
                                                setItemId(option.id);
                                            }}
                                            placeholder="持ち物名で検索"
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
                                            selectedNatureId={natureId}
                                            onChangeText={(value) => {
                                                setNature(value);
                                                setNatureId(null);
                                                setSelectedNatureMaster(null);
                                            }}
                                            onSelect={(option) => {
                                                setNature(option.name);
                                                setNatureId(option.id);
                                                setSelectedNatureMaster(option);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <EffortValueEditor
                                values={{
                                    h: evH,
                                    a: evA,
                                    b: evB,
                                    c: evC,
                                    d: evD,
                                    s: evS,
                                }}
                                limits={effortValueLimits}
                                nature={selectedNatureMaster}
                                onChange={(statKey, value) => {
                                    const setterMap = {
                                        h: setEvH,
                                        a: setEvA,
                                        b: setEvB,
                                        c: setEvC,
                                        d: setEvD,
                                        s: setEvS,
                                    };

                                    setterMap[statKey](value);
                                }}
                            />

                            <MoveListEditor
                                moves={[
                                    {
                                        name: move1,
                                        id: move1Id,
                                        type: move1Type,
                                    },
                                    {
                                        name: move2,
                                        id: move2Id,
                                        type: move2Type,
                                    },
                                    {
                                        name: move3,
                                        id: move3Id,
                                        type: move3Type,
                                    },
                                    {
                                        name: move4,
                                        id: move4Id,
                                        type: move4Type,
                                    },
                                ]}
                                onChange={(moveIndex, move) => {
                                    const setterList = [
                                        {
                                            setName: setMove1,
                                            setId: setMove1Id,
                                            setType: setMove1Type,
                                        },
                                        {
                                            setName: setMove2,
                                            setId: setMove2Id,
                                            setType: setMove2Type,
                                        },
                                        {
                                            setName: setMove3,
                                            setId: setMove3Id,
                                            setType: setMove3Type,
                                        },
                                        {
                                            setName: setMove4,
                                            setId: setMove4Id,
                                            setType: setMove4Type,
                                        },
                                    ];

                                    const setter = setterList[moveIndex];

                                    if (!setter) {
                                        return;
                                    }

                                    setter.setName(move.name);
                                    setter.setId(move.id);
                                    setter.setType(move.type);
                                }}
                            />

                            <div className="mt-5 max-w-4xl">
                                <label className="block text-sm font-medium">
                                    メモ
                                </label>

                                <textarea
                                    className="mt-1 w-full rounded border p-3"
                                    value={memo}
                                    onChange={(event) =>
                                        setMemo(event.target.value)
                                    }
                                    rows={3}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded border bg-white p-5">
                        <h2 className="text-lg font-bold">役割タグ</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            このポケモンの主な役割を3個まで選べます。(タグにマウスを重ねて説明表示)
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            タグを付けすぎると、おすすめ選出の点数が偏るため、重要な役割だけを選んでください。
                        </p>

                        <p className="mt-2 text-xs font-medium text-gray-600">
                            選択中：
                            {selectedRoleTagIds.length} / 3
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                            {roleTags.map((tag) => {
                                const isSelected = selectedRoleTagIds.includes(
                                    tag.id,
                                );

                                return (
                                    <div
                                        key={tag.id}
                                        className="group relative"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleRoleTag(tag.id)
                                            }
                                            className={`rounded-full border px-4 py-2 text-sm ${
                                                isSelected
                                                    ? "border-black bg-black text-white"
                                                    : "bg-white hover:bg-gray-50"
                                            }`}
                                        >
                                            {tag.name}
                                        </button>

                                        <div
                                            id={`role-tag-${tag.id}-description`}
                                            role="tooltip"
                                            className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-72 -translate-x-1/2 rounded bg-gray-900 p-3 text-left text-xs leading-relaxed text-white shadow-lg group-hover:block"
                                        >
                                            <p className="font-semibold">
                                                {tag.name}
                                            </p>

                                            <p className="mt-1">
                                                {tag.description}
                                            </p>

                                            {tag.examples &&
                                                tag.examples.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="font-semibold">
                                                            例
                                                        </p>

                                                        <ul className="mt-1 space-y-0.5">
                                                            {tag.examples.map(
                                                                (example) => (
                                                                    <li
                                                                        key={
                                                                            example
                                                                        }
                                                                    >
                                                                        ・
                                                                        {
                                                                            example
                                                                        }
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>
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
            </main>
        </>
    );
}
