"use client";

import { AppHeader } from "@/components/AppHeader";
import { PageStateMessage } from "@/components/pageStates/PageStateMessage";
import {
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { createPartyPokemon } from "@/features/partyPokemon/api/partyPokemonApi";
import { PartyPokemonBuildSection } from "@/features/partyPokemon/components/PartyPokemonBuildSection";
import { PartyPokemonSearchSection } from "@/features/partyPokemon/components/PartyPokemonSearchSection";
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

        ability,
        abilityId,
        resetAbility,

        nature,
        natureId,

        selectedNatureMaster,

        memo,
        setMemo,

        effortValues,
        moves,

        validationEffortValues,
        validationMoveEntries,
        validationMoves,

        updateEffortValue,
        updateMove,

        createRequestPokemon,

        selectAbility,
        changeItemText,
        selectItem,
        changeNatureText,
        selectNature,
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

        const effortValueLimits = getEffortValueLimits(party.rule);

        const validationResult = validatePartyPokemonInput({
            pokemonKey,
            existingPokemonKeys: currentPokemonList.map(
                (partyPokemon) => partyPokemon.pokemon_key,
            ),

            ability,
            abilityId,

            nature,
            natureId,

            moveEntries: validationMoveEntries,
            effortValues: validationEffortValues,
            moves: validationMoves,

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

                    <PartyPokemonBuildSection
                        pokemonKey={pokemonKey}
                        formKey={formKey}
                        nickname={nickname}
                        onChangeNickname={setNickname}
                        abilityId={abilityId}
                        onSelectAbility={selectAbility}
                        item={item}
                        onChangeItemText={changeItemText}
                        onSelectItem={selectItem}
                        nature={nature}
                        natureId={natureId}
                        natureMaster={selectedNatureMaster}
                        onChangeNatureText={changeNatureText}
                        onSelectNature={selectNature}
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
