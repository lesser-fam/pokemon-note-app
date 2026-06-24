"use client";

import { AppHeader } from "@/components/AppHeader";
import { PageStateMessage } from "@/components/pageStates/PageStateMessage";
import { summarizeBattleLogs } from "@/features/battleLogs/utils/summarizeBattleLogs";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { findPokemonMaster } from "@/features/master/utils/findPokemonMaster";
import { fetchParty } from "@/features/parties/api/partyApi";
import { BattleLogListSection } from "@/features/parties/components/BattleLogListSection";
import { BattleLogSummarySection } from "@/features/parties/components/BattleLogSummarySection";
import { PartyDetailHeader } from "@/features/parties/components/PartyDetailHeader";
import { PartyDetailNavigationLinks } from "@/features/parties/components/PartyDetailNavigationLinks";
import { PartyVersionHistory } from "@/features/parties/components/PartyVersionHistory";
import { RegisteredPartyPokemonSection } from "@/features/parties/components/RegisteredPartyPokemonSection";
import { SavedSelectionTemplatesSection } from "@/features/parties/components/SavedSelectionTemplatesSection";
import { SuggestedSelectionSection } from "@/features/parties/components/SuggestedSelectionSection";
import { usePartyDetailActions } from "@/features/parties/hooks/usePartyDetailAction";
import { canRemoveInitialPartyPokemon } from "@/features/parties/utils/canRemoveInitialPartyPokemon";
import { getPartyRuleConfig } from "@/features/pokemonRules/partyRuleConfig";
import { suggestBasicSelection } from "@/features/selections/utils/suggestBasicSelection";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PartyDetailPage() {
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

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

    const ruleConfig = party ? getPartyRuleConfig(party.rule) : null;

    const currentPokemonList = party?.current_version?.pokemon ?? [];
    const allVersionPokemonList =
        party?.versions?.flatMap((version) => version.pokemon ?? []) ??
        currentPokemonList;
    const suggestedSelection = suggestBasicSelection(currentPokemonList);
    const currentBattleLogs = party?.current_version?.battle_logs ?? [];
    const allBattleLogs =
        party?.versions?.flatMap((version) => version.battle_logs ?? []) ??
        currentBattleLogs;
    const currentBattleLogSummary = summarizeBattleLogs(currentBattleLogs);
    const allBattleLogSummary = summarizeBattleLogs(allBattleLogs);

    const {
        isSavingSelection,
        isDeletingParty,
        deletingPartyPokemonId,
        deletingBattleLogId,
        handleDeleteParty,
        handleRemoveInitialPokemon,
        handleSaveSuggestedSelection,
        handleDeleteSelectionTemplate,
        handleDeleteBattleLog,
    } = usePartyDetailActions({
        party,
        suggestedSelection,
        partyPokemonLimit: ruleConfig?.partyPokemonLimit ?? 0,
        setParty,
        setErrorMessage,
    });

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

    if (errorMessage || !party || !ruleConfig) {
        return (
            <PageStateMessage
                message={errorMessage || "パーティが見つかりません。"}
                variant="error"
            />
        );
    }

    const canRemoveInitialPokemon = canRemoveInitialPartyPokemon({
        currentVersion: party.current_version,
        currentPokemonCount: currentPokemonList.length,
        partyPokemonLimit: ruleConfig.partyPokemonLimit,
    });

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

                <div className="grid gap-5 xl:grid-cols-2">
                    <BattleLogSummarySection
                        title="現在バージョンの対戦ログ集計"
                        description="今のパーティ構築で保存した対戦ログの集計です。"
                        battleLogSummary={currentBattleLogSummary}
                        partyPokemonList={currentPokemonList}
                        pokemonList={pokemonList}
                    />

                    <BattleLogSummarySection
                        title="パーティ総合の対戦ログ集計"
                        description="このパーティを管理し始めてから、全バージョンで保存した対戦ログの集計です。"
                        battleLogSummary={allBattleLogSummary}
                        partyPokemonList={allVersionPokemonList}
                        pokemonList={pokemonList}
                    />
                </div>

                <div className="mt-8 grid gap-5 xl:grid-cols-2">
                    <BattleLogListSection
                        partyId={party.id}
                        title="現在バージョンの対戦ログ"
                        description="今のパーティ構築で保存した対戦ログです。"
                        battleLogs={currentBattleLogs}
                        pokemonList={pokemonList}
                        deletingBattleLogId={deletingBattleLogId}
                        onDeleteBattleLog={handleDeleteBattleLog}
                    />

                    <BattleLogListSection
                        partyId={party.id}
                        title="パーティ総合の対戦ログ"
                        description="このパーティを管理し始めてから、全バージョンで保存した対戦ログです。"
                        battleLogs={allBattleLogs}
                        pokemonList={pokemonList}
                        deletingBattleLogId={deletingBattleLogId}
                        onDeleteBattleLog={handleDeleteBattleLog}
                    />
                </div>

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
