"use client";

import { AppHeader } from "@/components/AppHeader";
import { isMegaForm } from "@/features/battlePreview/utils/megaEvolution";
import {
    fetchNatureList,
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import { fetchParty } from "@/features/parties/api/partyApi";
import { PokemonBuildEditor } from "@/features/partyPokemon/components/PokemonBuildEditor";
import { PokemonSearchSelector } from "@/features/partyPokemon/components/PokemonSearchSelector";
import { createNewPartyVersion } from "@/features/partyVersions/api/partyVersionApi";
import {
    effortValueFieldMap,
    moveFieldMap,
} from "@/features/partyVersions/constants/editablePokemonFields";
import { useEditablePokemonList } from "@/features/partyVersions/hooks/useEditablePokemonList";
import { usePartyVersionPokemonSelection } from "@/features/partyVersions/hooks/usePartyVersionPokemonSelection";
import { convertPartyPokemonToEditablePokemon } from "@/features/partyVersions/utils/editablePokemon";
import { validateEditablePokemonList } from "@/features/partyVersions/utils/validateEditablePokemonList";
import { isPokemonAvailableForRule } from "@/features/pokemonRules/isPokemonAvailableForRule";
import { PartyRuleBadge } from "@/features/pokemonRules/PartyRuleBadge";
import {
    getEffortValueLimits,
    getPartyRuleConfig,
} from "@/features/pokemonRules/partyRuleConfig";
import type { NatureMaster } from "@/types/battleMaster";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { FormEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";

export default function CreatePartyVersionPage() {
    const router = useRouter();
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const ruleConfig = getPartyRuleConfig(party?.rule ?? "main_series");
    const effortValueLimits = getEffortValueLimits(
        party?.rule ?? "main_series",
    );
    const [roleTags, setRoleTags] = useState<RoleTag[]>([]);
    const [natureList, setNatureList] = useState<NatureMaster[]>([]);

    const {
        editablePokemonList,
        initializePokemonList,
        updatePokemon,
        toggleRoleTag,
        addPokemon,
        replacePokemon,
        removePokemon,
    } = useEditablePokemonList();

    const {
        selectedPokemonIndex,
        editingPokemonIndex,
        replaceTargetIndex,
        selectPokemon,
        startEditingSelectedPokemon,
        startReplacingSelectedPokemon,
        finishAddingPokemon,
        finishReplacingPokemon,
        finishRemovingPokemon,
        cancelReplacingPokemon,
        closePokemonEditor,
    } = usePartyVersionPokemonSelection();

    const [changeNote, setChangeNote] = useState("");

    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

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
                    convertPartyPokemonToEditablePokemon,
                );

                initializePokemonList(initialEditablePokemon);
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
    }, [partyId, isInvalidPartyId, initializePokemonList]);

    const findNatureMaster = (
        natureId: number | null,
    ): NatureMaster | undefined => {
        if (natureId === null) {
            return undefined;
        }

        return natureList.find((nature) => nature.id === natureId);
    };

    const scrollToSection = (sectionRef: RefObject<HTMLDivElement | null>) => {
        window.requestAnimationFrame(() => {
            sectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    };

    const handleStartReplacingSelectedPokemon = () => {
        const replacingIndex = startReplacingSelectedPokemon();

        if (replacingIndex === null) {
            return;
        }

        setSearchKeyword("");
        setSelectedTypes([]);

        scrollToSection(pokemonSearchSectionRef);
    };

    const handleRemoveSelectedPokemon = () => {
        if (selectedPokemonIndex === null) {
            return;
        }

        const removedIndex = selectedPokemonIndex;

        removePokemon(removedIndex);
        finishRemovingPokemon(removedIndex);
    };

    const handleAddPokemon = (pokemon: Pokemon) => {
        if (editablePokemonList.length >= ruleConfig.partyPokemonLimit) {
            return;
        }

        const addedIndex = editablePokemonList.length;

        addPokemon(pokemon);

        finishAddingPokemon(addedIndex);
    };

    const handleReplacePokemon = (pokemon: Pokemon) => {
        if (replaceTargetIndex === null) {
            return;
        }

        const replacedIndex = replaceTargetIndex;

        replacePokemon(replacedIndex, pokemon);
        finishReplacingPokemon(replacedIndex);
    };

    const isAlreadySelectedPokemon = (pokemon: Pokemon) => {
        return editablePokemonList.some(
            (editablePokemon, index) =>
                index !== replaceTargetIndex &&
                editablePokemon.pokemon_key === pokemon.key,
        );
    };

    const handleSelectPokemonCard = (index: number) => {
        selectPokemon(index);
    };

    const handleStartEditingSelectedPokemon = () => {
        const editingIndex = startEditingSelectedPokemon();

        if (editingIndex === null) {
            return;
        }

        scrollToSection(pokemonEditorSectionRef);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!party?.current_version) {
            setErrorMessage("現在のバージョンが見つかりません。");
            return;
        }

        if (editablePokemonList.length !== ruleConfig.partyPokemonLimit) {
            setErrorMessage(
                `新しいバージョンは${ruleConfig.partyPokemonLimit}匹そろえて保存してください。`,
            );
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
            // if (pokemon.item.trim() !== "" && pokemon.item_id === null) {
            //     return true;
            // }

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
            setErrorMessage("特性、性格、技は検索候補から選択してください。");
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

        const validationResult = validateEditablePokemonList(
            editablePokemonList,
            effortValueLimits,
        );

        if (!validationResult.isValid) {
            if (validationResult.error === "invalid_effort_values") {
                setErrorMessage(
                    `${effortValueLimits.label}では、努力値は1項目${effortValueLimits.singleLimit}まで、合計${effortValueLimits.totalLimit}までです。`,
                );
                return;
            }

            if (validationResult.error === "duplicated_items") {
                setErrorMessage("同じ持ち物は同じパーティに登録できません。");
                return;
            }

            setErrorMessage(
                "同じポケモンに同じ技を複数登録することはできません。",
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

    const editingPokemon =
        editingPokemonIndex !== null
            ? editablePokemonList[editingPokemonIndex]
            : null;

    const editingPokemonMaster = editingPokemon
        ? findPokemonMaster({
              pokemonList,
              pokemonKey: editingPokemon.pokemon_key,
              formKey: editingPokemon.form_key,
          })
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

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <h1 className="mt-4 text-2xl font-bold">
                        新バージョン作成
                    </h1>

                    <PartyRuleBadge rule={party.rule} />
                </div>

                <p className="mt-1 text-sm text-gray-600">
                    現在のパーティを元に、{ruleConfig.partyPokemonLimit}
                    匹を調整して新しいバージョンとして保存します。
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
                                        新しい{ruleConfig.partyPokemonLimit}匹
                                    </h2>

                                    <p className="text-sm font-medium text-gray-600">
                                        {editablePokemonList.length} /{" "}
                                        {ruleConfig.partyPokemonLimit}
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
                                const pokemonMaster = findPokemonMaster({
                                    pokemonList,
                                    pokemonKey: pokemon.pokemon_key,
                                    formKey: pokemon.form_key,
                                });

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
                                        onClick={closePokemonEditor}
                                        className="text-sm text-blue-600"
                                    >
                                        編集欄を閉じる
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <PokemonBuildEditor
                                        pokemonKey={editingPokemon.pokemon_key}
                                        formKey={editingPokemon.form_key}
                                        nickname={editingPokemon.nickname}
                                        onChangeNickname={(value) =>
                                            updatePokemon(
                                                editingPokemonIndex,
                                                "nickname",
                                                value,
                                            )
                                        }
                                        abilityId={editingPokemon.ability_id}
                                        onSelectAbility={(selectedAbility) => {
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
                                        item={editingPokemon.item}
                                        onChangeItemText={(value) => {
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
                                        onSelectItem={(option) => {
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
                                        nature={editingPokemon.nature}
                                        natureId={editingPokemon.nature_id}
                                        natureMaster={editingNatureMaster}
                                        onChangeNatureText={(value) => {
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
                                        onSelectNature={(option) => {
                                            updatePokemon(
                                                editingPokemonIndex,
                                                "nature",
                                                option.name,
                                            );

                                            updatePokemon(
                                                editingPokemonIndex,
                                                "nature_id",
                                                option.id,
                                            );
                                        }}
                                        effortValues={{
                                            h: editingPokemon.ev_h,
                                            a: editingPokemon.ev_a,
                                            b: editingPokemon.ev_b,
                                            c: editingPokemon.ev_c,
                                            d: editingPokemon.ev_d,
                                            s: editingPokemon.ev_s,
                                        }}
                                        effortValueLimits={effortValueLimits}
                                        onChangeEffortValue={(
                                            statKey,
                                            value,
                                        ) => {
                                            updatePokemon(
                                                editingPokemonIndex,
                                                effortValueFieldMap[statKey],
                                                Number(value || 0),
                                            );
                                        }}
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
                                        onChangeMove={(moveIndex, move) => {
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
                                        memo={editingPokemon.memo}
                                        onChangeMemo={(value) =>
                                            updatePokemon(
                                                editingPokemonIndex,
                                                "memo",
                                                value,
                                            )
                                        }
                                        roleTags={roleTags}
                                        selectedRoleTagIds={
                                            editingPokemon.role_tag_ids
                                        }
                                        onToggleRoleTag={(roleTagId) =>
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
                                            ? `${ruleConfig.partyPokemonLimit}匹未満の場合、ここからポケモンを追加できます。`
                                            : "選んだポケモンでこの枠を入れ替えます。"}
                                    </p>
                                </div>

                                {replaceTargetIndex !== null && (
                                    <button
                                        type="button"
                                        onClick={cancelReplacingPokemon}
                                        className="text-sm text-blue-600"
                                    >
                                        入れ替えをやめる
                                    </button>
                                )}
                            </div>

                            {replaceTargetIndex === null &&
                            editablePokemonList.length >=
                                ruleConfig.partyPokemonLimit ? (
                                <p className="mt-4 rounded bg-white p-4 text-sm text-gray-600">
                                    すでに{ruleConfig.partyPokemonLimit}
                                    匹そろっています。入れ替えたいポケモンを選択し、
                                    「入れ替え」ボタンを押してください。
                                </p>
                            ) : (
                                <div className="mt-4">
                                    <PokemonSearchSelector
                                        pokemonList={pokemonList}
                                        searchKeyword={searchKeyword}
                                        onChangeSearchKeyword={setSearchKeyword}
                                        clearSearchKeywordOnSelect
                                        selectedTypes={selectedTypes}
                                        onChangeSelectedTypes={setSelectedTypes}
                                        filterPokemon={(pokemon) =>
                                            !isMegaForm(pokemon) &&
                                            isPokemonAvailableForRule(
                                                pokemon,
                                                party.rule,
                                            )
                                        }
                                        isPokemonDisabled={
                                            isAlreadySelectedPokemon
                                        }
                                        getPokemonStatusLabel={(pokemon) =>
                                            isAlreadySelectedPokemon(pokemon)
                                                ? "選択済み"
                                                : null
                                        }
                                        onSelectPokemon={(pokemon) => {
                                            if (
                                                isAlreadySelectedPokemon(
                                                    pokemon,
                                                )
                                            ) {
                                                return;
                                            }

                                            if (replaceTargetIndex === null) {
                                                handleAddPokemon(pokemon);

                                                return;
                                            }

                                            handleReplacePokemon(pokemon);
                                        }}
                                    />
                                </div>
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
