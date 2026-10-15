"use client";

import { summarizeBattleLogs } from "@/features/battleLogs/utils/summarizeBattleLogs";
import { BattleLogListSection } from "@/features/parties/components/BattleLogListSection";
import { BattleLogSummarySection } from "@/features/parties/components/BattleLogSummarySection";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import { useState } from "react";

type BattleLogAnalysisSectionProps = {
    party: Party;
    pokemonList: Pokemon[];
    deletingBattleLogId: number | null;
    onDeleteBattleLog: (battleLogId: number) => void;
};

export function BattleLogAnalysisSection({
    party,
    pokemonList,
    deletingBattleLogId,
    onDeleteBattleLog,
}: BattleLogAnalysisSectionProps) {
    const [selectedVersionId, setSelectedVersionId] = useState("all");
    const versions = party.versions?.length
        ? party.versions
        : party.current_version
          ? [party.current_version]
          : [];
    const selectedVersion = versions.find(
        (version) => String(version.id) === selectedVersionId,
    );
    const scopedVersions = selectedVersion ? [selectedVersion] : versions;
    const battleLogs = scopedVersions.flatMap(
        (version) => version.battle_logs ?? [],
    );
    const partyPokemonList = scopedVersions.flatMap(
        (version) => version.pokemon ?? [],
    );
    const scopeLabel = selectedVersion
        ? `Version ${selectedVersion.version_number}`
        : "全バージョン";
    const description = selectedVersion
        ? `このパーティのVersion ${selectedVersion.version_number}で保存した対戦ログです。`
        : "このパーティの全バージョンで保存した対戦ログです。";

    return (
        <section className="mt-8" aria-labelledby="battle-log-analysis-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 id="battle-log-analysis-heading" className="text-xl font-bold">
                        対戦ログ・集計
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        バージョンを選ぶと、成績と対戦ログが一緒に切り替わります。
                    </p>
                </div>
                <div className="w-full sm:w-auto">
                    <label htmlFor="battle-log-version" className="block text-sm font-semibold">
                        パーティバージョン
                    </label>
                    <select
                        id="battle-log-version"
                        value={selectedVersion ? String(selectedVersion.id) : "all"}
                        onChange={(event) => setSelectedVersionId(event.target.value)}
                        className="mt-1 w-full rounded border bg-white px-3 py-2 text-sm sm:min-w-48"
                    >
                        <option value="all">全バージョン</option>
                        {[...versions]
                            .sort((a, b) => b.version_number - a.version_number)
                            .map((version) => (
                                <option key={version.id} value={version.id}>
                                    Version {version.version_number}
                                    {version.is_current ? "（現在）" : ""}
                                </option>
                            ))}
                    </select>
                </div>
            </div>
            <BattleLogSummarySection
                title={`${scopeLabel}の対戦ログ集計`}
                description={description}
                battleLogSummary={summarizeBattleLogs(battleLogs)}
                partyPokemonList={partyPokemonList}
                pokemonList={pokemonList}
            />
            <div className="mt-5">
                <BattleLogListSection
                    partyId={party.id}
                    title={`${scopeLabel}の対戦ログ`}
                    description={description}
                    battleLogs={battleLogs}
                    pokemonList={pokemonList}
                    deletingBattleLogId={deletingBattleLogId}
                    onDeleteBattleLog={onDeleteBattleLog}
                />
            </div>
        </section>
    );
}
