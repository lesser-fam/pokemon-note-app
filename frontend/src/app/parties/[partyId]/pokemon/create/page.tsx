"use client";

import { AppHeader } from "@/components/AppHeader";
import { PageStateMessage } from "@/components/pageStates/PageStatesMessage";
import {
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { createPartyPokemon } from "@/features/partyPokemon/api/partyPokemonApi";
import { PartyPokemonSearchSection } from "@/features/partyPokemon/components/PartyPokemonSearchSection";
import { PokemonBuildEditor } from "@/features/partyPokemon/components/PokemonBuildEditor";
import { SelectedPokemonPreviewCard } from "@/features/partyPokemon/components/SelectedPokemonPreviewCard";
import { usePartyPokemonForm } from "@/features/partyPokemon/hooks/usePartyPokemonForm";
import { toggleRoleTagId } from "@/features/partyPokemon/utils/toggleRoleTagId";
import { validatePartyPokemonInput } from "@/features/partyPokemon/utils/validatePartyPokemonInput";
import { PartyRuleBadge } from "@/features/pokemonRules/PartyRuleBadge";
import {
    getEffortValueLimits,
    getPartyRuleConfig,
} from "@/features/pokemonRules/partyRuleConfig";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";
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
    const ruleConfig = getPartyRuleConfig(party?.rule ?? "main_series");
    const effortValueLimits = getEffortValueLimits(
        party?.rule ?? "main_series",
    );
    const [roleTags, setRoleTags] = useState<RoleTag[]>([]);

    const [pokemonKey, setPokemonKey] = useState("");
    const [formKey, setFormKey] = useState("default");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedRoleTagIds, setSelectedRoleTagIds] = useState<number[]>([]);

    const {
        nickname,
        setNickname,

        item,
        setItem,
        itemId,
        setItemId,

        ability,
        setAbility,
        abilityId,
        setAbilityId,
        resetAbility,

        nature,
        setNature,
        natureId,
        setNatureId,
        selectedNatureMaster,
        setSelectedNatureMaster,

        evH,
        evA,
        evB,
        evC,
        evD,
        evS,

        move1,
        move1Id,
        move1Type,

        move2,
        move2Id,
        move2Type,

        move3,
        move3Id,
        move3Type,

        move4,
        move4Id,
        move4Type,

        memo,
        setMemo,

        effortValues,
        moves,

        updateEffortValue,
        updateMove,
    } = usePartyPokemonForm();

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

    const handleSelectPokemon = (pokemon: Pokemon) => {
        setPokemonKey(pokemon.key);
        setFormKey(pokemon.form_key);

        resetAbility();
    };

    const handleToggleRoleTag = (roleTagId: number) => {
        setSelectedRoleTagIds((currentIds) =>
            toggleRoleTagId(currentIds, roleTagId),
        );
    };

    const selectedPokemonMaster = pokemonList.find(
        (pokemon) => pokemon.key === pokemonKey && pokemon.form_key === formKey,
    );

    const currentPokemonList = party?.current_version?.pokemon ?? [];

    const isAlreadyRegisteredPokemon = (pokemon: Pokemon) => {
        return currentPokemonList.some(
            (partyPokemon) => partyPokemon.pokemon_key === pokemon.key,
        );
    };

    const toNumber = (value: string) => {
        return Number(value || 0);
    };

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

        if (currentPokemonList.length >= ruleConfig.partyPokemonLimit) {
            setErrorMessage(
                `このパーティには${ruleConfig.partyPokemonLimit}匹まで登録できます。`,
            );
            return;
        }

        // if (item.trim() !== "" && itemId === null) {
        //     setErrorMessage("持ち物は検索候補から選択してください。");
        //     return;
        // }

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

        const effortValueLimits = getEffortValueLimits(party.rule);

        const effortValues = [
            toNumber(evH),
            toNumber(evA),
            toNumber(evB),
            toNumber(evC),
            toNumber(evD),
            toNumber(evS),
        ];

        const validationResult = validatePartyPokemonInput({
            effortValues,
            moves: [move1, move2, move3, move4],
            item,
            existingItems: currentPokemonList.map(
                (partyPokemon) => partyPokemon.item,
            ),
            effortValueLimits,
        });

        if (!validationResult.isValid) {
            if (validationResult.error === "invalid_effort_values") {
                setErrorMessage(
                    `${effortValueLimits.label}では、努力値は1項目${effortValueLimits.singleLimit}まで、合計${effortValueLimits.totalLimit}までです。`,
                );
                return;
            }

            if (validationResult.error === "duplicated_item") {
                setErrorMessage("同じ持ち物は同じパーティに登録できません。");
                return;
            }

            setErrorMessage(
                "同じポケモンに同じ技を複数登録することはできません。",
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

    if (isInvalidPartyId) {
        return (
            <PageStateMessage
                message="パーティIDが正しくありません。"
                variant="error"
            />
        );
    }

    if (isLoading) {
        return <PageStateMessage message="読み込み中..." />;
    }

    if (!party) {
        return (
            <PageStateMessage
                message="パーティが見つかりません。"
                variant="error"
            />
        );
    }

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

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <h1 className="mt-4 text-2xl font-bold">ポケモン追加</h1>

                    <PartyRuleBadge rule={party.rule} />
                </div>
                <p className="mt-1 text-sm text-gray-600">
                    {party.name} に登録するポケモンを追加します。
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                    <PartyPokemonSearchSection
                        pokemonList={pokemonList}
                        partyRule={party.rule}
                        selectedPokemonKey={pokemonKey}
                        selectedFormKey={formKey}
                        searchKeyword={searchKeyword}
                        selectedTypes={selectedTypes}
                        onChangeSearchKeyword={setSearchKeyword}
                        onChangeSelectedTypes={setSelectedTypes}
                        isPokemonRegistered={isAlreadyRegisteredPokemon}
                        onSelectPokemon={handleSelectPokemon}
                    />

                    <SelectedPokemonPreviewCard
                        pokemonKey={pokemonKey}
                        selectedPokemonMaster={selectedPokemonMaster}
                    />

                    <section className="rounded border bg-white p-5">
                        <h2 className="text-lg font-bold">型・技情報</h2>

                        <div className="mt-4">
                            <PokemonBuildEditor
                                pokemonKey={pokemonKey}
                                formKey={formKey}
                                nickname={nickname}
                                onChangeNickname={setNickname}
                                abilityId={abilityId}
                                onSelectAbility={(selectedAbility) => {
                                    setAbility(selectedAbility.name);

                                    setAbilityId(selectedAbility.id);
                                }}
                                item={item}
                                onChangeItemText={(value) => {
                                    setItem(value);
                                    setItemId(null);
                                }}
                                onSelectItem={(option) => {
                                    setItem(option.name);
                                    setItemId(option.id);
                                }}
                                nature={nature}
                                natureId={natureId}
                                natureMaster={selectedNatureMaster}
                                onChangeNatureText={(value) => {
                                    setNature(value);
                                    setNatureId(null);
                                    setSelectedNatureMaster(null);
                                }}
                                onSelectNature={(option) => {
                                    setNature(option.name);
                                    setNatureId(option.id);
                                    setSelectedNatureMaster(option);
                                }}
                                effortValues={effortValues}
                                effortValueLimits={effortValueLimits}
                                onChangeEffortValue={updateEffortValue}
                                moves={moves}
                                onChangeMove={updateMove}
                                memo={memo}
                                onChangeMemo={setMemo}
                                roleTags={roleTags}
                                selectedRoleTagIds={selectedRoleTagIds}
                                onToggleRoleTag={handleToggleRoleTag}
                            />
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
