"use client";

import { AppHeader } from "@/components/AppHeader";
import { PageStateMessage } from "@/components/pageStates/PageStateMessage";
import { deleteBattleLog } from "@/features/battleLogs/api/battleLogApi";
import { summarizeBattleLogs } from "@/features/battleLogs/utils/summarizeBattleLogs";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import { deleteParty, fetchParty } from "@/features/parties/api/partyApi";
import { BattleLogSummarySection } from "@/features/parties/components/BattleLogSummarySection";
import { PartyDetailHeader } from "@/features/parties/components/PartyDetailHeader";
import { PartyDetailNavigationLinks } from "@/features/parties/components/PartyDetailNavigationLinks";
import { PartyVersionHistory } from "@/features/parties/components/PartyVersionHistory";
import { RegisteredPartyPokemonSection } from "@/features/parties/components/RegisteredPartyPokemonSection";
import { SavedSelectionTemplatesSection } from "@/features/parties/components/SavedSelectionTemplatesSection";
import { SuggestedSelectionSection } from "@/features/parties/components/SuggestedSelectionSection";
import { deletePartyPokemon } from "@/features/partyPokemon/api/partyPokemonApi";
import { getPartyRuleConfig } from "@/features/pokemonRules/partyRuleConfig";
import { suggestBasicSelection } from "@/features/selections/utils/suggestBasicSelection";
import {
    createSelectionTemplate,
    deleteSelectionTemplate,
} from "@/features/selectionTemplates/api/selectionTemplateApi";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BattleLogListSection } from "@/features/parties/components/BattleLogListSection";
import { createSuggestedSelectionTemplatePayload } from "@/features/selectionTemplates/utils/createSuggestedSelectionTemplatePayload";

export default function PartyDetailPage() {
    const router = useRouter();
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingSelection, setIsSavingSelection] = useState(false);
    const [isDeletingParty, setIsDeletingParty] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [deletingPartyPokemonId, setDeletingPartyPokemonId] = useState<
        number | null
    >(null);
    const [deletingBattleLogId, setDeletingBattleLogId] = useState<
        number | null
    >(null);

    useEffect(() => {
        const loadParty = async () => {
            try {
                const [partyData, pokemonData] = await Promise.all([
                    fetchParty(partyId),
                    fetchPokemonList(),
                ]);

                setParty(partyData);
                setPokemonList(pokemonData);
            } catch (error) {
                console.error(error);
                setErrorMessage("パーティ詳細の取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (isInvalidPartyId) {
            return;
        }

        loadParty();
    }, [partyId, isInvalidPartyId]);

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

    if (errorMessage || !party) {
        return (
            <PageStateMessage
                message={errorMessage || "パーティが見つかりません。"}
                variant="error"
            />
        );
    }

    const ruleConfig = getPartyRuleConfig(party.rule);

    const currentPokemonList = party.current_version?.pokemon ?? [];
    const suggestedSelection = suggestBasicSelection(currentPokemonList);
    const battleLogs = party.current_version?.battle_logs ?? [];
    const battleLogSummary = summarizeBattleLogs(battleLogs);

    const canRemoveInitialPokemon =
        party.current_version?.is_current === true &&
        party.current_version.version_number === 1 &&
        currentPokemonList.length < ruleConfig.partyPokemonLimit &&
        (party.current_version.selection_templates?.length ?? 0) === 0 &&
        (party.current_version.battle_logs?.length ?? 0) === 0;

    const refreshParty = async () => {
        const refreshedParty = await fetchParty(party.id);
        setParty(refreshedParty);
    };

    const handleDeleteParty = async () => {
        const confirmed = window.confirm(
            "このパーティを削除します。登録ポケモン、基本選出、対戦ログ、バージョン履歴も確認できなくなります。よろしいですか？",
        );

        if (!confirmed) {
            return;
        }

        setIsDeletingParty(true);
        setErrorMessage("");

        try {
            await deleteParty(party.id);

            router.replace("/parties");
        } catch (error) {
            console.error(error);

            setErrorMessage("パーティの削除に失敗しました。");

            setIsDeletingParty(false);
        }
    };

    const handleRemoveInitialPokemon = async (partyPokemonId: number) => {
        const confirmed = window.confirm(
            "このポケモンをパーティから外します。よろしいですか？",
        );

        if (!confirmed) {
            return;
        }

        setDeletingPartyPokemonId(partyPokemonId);
        setErrorMessage("");

        try {
            await deletePartyPokemon(partyPokemonId);

            await refreshParty();
        } catch (error) {
            console.error(error);
            setErrorMessage(
                `ポケモンを外せませんでした。${ruleConfig.partyPokemonLimit}匹そろった後の変更は、新バージョン作成から行ってください。`,
            );
        } finally {
            setDeletingPartyPokemonId(null);
        }
    };

    const handleSaveSuggestedSelection = async () => {
        if (!party.current_version) {
            setErrorMessage("現在のバージョンが見つかりません。");
            return;
        }

        const suggestedSelectionPayload =
            createSuggestedSelectionTemplatePayload(suggestedSelection);

        if (!suggestedSelectionPayload.isValid) {
            setErrorMessage("保存できる基本選出がありません。");
            return;
        }

        setIsSavingSelection(true);
        setErrorMessage("");

        try {
            await createSelectionTemplate(
                party.current_version.id,
                suggestedSelectionPayload.payload,
            );

            await refreshParty();
        } catch (error) {
            console.error(error);
            setErrorMessage("基本選出の保存に失敗しました。");
        } finally {
            setIsSavingSelection(false);
        }
    };

    const handleDeleteSelectionTemplate = async (
        selectionTemplateId: number,
    ) => {
        const confirmed = window.confirm(
            "この基本選出を削除します。よろしいですか？",
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteSelectionTemplate(selectionTemplateId);

            await refreshParty();
        } catch (error) {
            console.error(error);
            setErrorMessage("基本選出の削除に失敗しました。");
        }
    };

    const handleDeleteBattleLog = async (battleLogId: number) => {
        const confirmed = window.confirm(
            "この対戦ログを削除します。よろしいですか？",
        );

        if (!confirmed) {
            return;
        }

        setDeletingBattleLogId(battleLogId);
        setErrorMessage("");

        try {
            await deleteBattleLog(battleLogId);

            await refreshParty();
        } catch (error) {
            console.error(error);

            setErrorMessage("対戦ログの削除に失敗しました。");
        } finally {
            setDeletingBattleLogId(null);
        }
    };

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-7xl p-8">
                <Link href="/parties" className="text-sm text-blue-600">
                    ← パーティ一覧へ戻る
                </Link>

                <PartyDetailHeader
                    party={party}
                    isDeletingParty={isDeletingParty}
                    onDeleteParty={handleDeleteParty}
                />

                <PartyDetailNavigationLinks partyId={party.id} />

                <RegisteredPartyPokemonSection
                    partyId={party.id}
                    currentPokemonList={currentPokemonList}
                    pokemonList={pokemonList}
                    partyPokemonLimit={ruleConfig.partyPokemonLimit}
                    canRemoveInitialPokemon={canRemoveInitialPokemon}
                    deletingPartyPokemonId={deletingPartyPokemonId}
                    onRemoveInitialPokemon={handleRemoveInitialPokemon}
                />

                <section className="mt-8 grid gap-5 lg:grid-cols-2">
                    <SuggestedSelectionSection
                        suggestedSelection={suggestedSelection}
                        currentPokemonCount={currentPokemonList.length}
                        selectionPokemonLimit={ruleConfig.selectionPokemonLimit}
                        isSavingSelection={isSavingSelection}
                        onSaveSuggestedSelection={handleSaveSuggestedSelection}
                        pokemonList={pokemonList}
                    />

                    <SavedSelectionTemplatesSection
                        partyId={party.id}
                        selectionTemplates={
                            party.current_version?.selection_templates ?? []
                        }
                        onDeleteSelectionTemplate={
                            handleDeleteSelectionTemplate
                        }
                        pokemonList={pokemonList}
                    />
                </section>

                <BattleLogSummarySection
                    battleLogSummary={battleLogSummary}
                    currentPokemonList={currentPokemonList}
                    pokemonList={pokemonList}
                />

                <BattleLogListSection
                    partyId={party.id}
                    battleLogs={battleLogs}
                    pokemonList={pokemonList}
                    deletingBattleLogId={deletingBattleLogId}
                    onDeleteBattleLog={handleDeleteBattleLog}
                />

                <PartyVersionHistory
                    versions={party.versions ?? []}
                    findPokemonMaster={(pokemonKey, formKey) =>
                        findPokemonMaster({
                            pokemonList,
                            pokemonKey,
                            formKey,
                        })
                    }
                />
            </main>
        </>
    );
}
