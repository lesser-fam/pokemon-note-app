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
import { getPartyPokemonInputValidationMessage } from "@/features/partyPokemon/utils/getPartyPokemonInputValidationMessage";
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

        move1,
        move1Id,

        move2,
        move2Id,

        move3,
        move3Id,

        move4,
        move4Id,

        memo,
        setMemo,

        effortValues,
        moves,

        updateEffortValue,
        updateMove,

        createRequestPokemon,

        validateEffortValues,
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

        const validationResult = validatePartyPokemonInput({
            effortValues: validateEffortValues,
            moves: [move1, move2, move3, move4],
            item,
            existingItems: currentPokemonList.map(
                (partyPokemon) => partyPokemon.item,
            ),
            effortValueLimits,
        });

        if (!validationResult.isValid) {
            setErrorMessage(
                getPartyPokemonInputValidationMessage(
                    validationResult.error,
                    effortValueLimits,
                ),
            );
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await createPartyPokemon(
                party.current_version.id,
                createRequestPokemon(pokemonKey, formKey, selectedRoleTagIds),
            );

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
