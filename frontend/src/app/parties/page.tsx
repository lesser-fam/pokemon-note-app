"use client";

import { AppHeader } from "@/components/AppHeader";
import { fetchParties } from "@/features/parties/api/partyApi";
import type { Party } from "@/types/party";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PartiesPage() {
    const [parties, setParties] = useState<Party[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadParties = async () => {
            try {
                const data = await fetchParties();
                setParties(data);
            } catch (error) {
                console.error(error);
                setErrorMessage("パーティ一覧の取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        loadParties();
    }, []);

    const getBattleRuleLabel = (rule: string | null) => {
        if (rule === "champions") {
            return "チャンピオンズ";
        }

        return "本編ルール";
    };

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-5xl p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">パーティ一覧</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            使用するパーティを管理します。
                        </p>
                    </div>

                    <Link
                        href="/parties/create"
                        className="rounded bg-black px-4 py-2 text-white"
                    >
                        新規作成
                    </Link>
                </div>

                {isLoading && <p className="mt-8">読み込み中...</p>}

                {errorMessage && (
                    <p className="mt-8 rounded bg-red-100 p-3 text-red-700">
                        {errorMessage}
                    </p>
                )}

                {!isLoading && !errorMessage && parties.length === 0 && (
                    <div className="mt-8 rounded border p-6 text-gray-700">
                        <p>まだパーティが登録されていません。</p>
                        <p className="mt-2 text-sm">
                            「新規作成」から最初のパーティを作成しましょう。
                        </p>
                    </div>
                )}

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {parties.map((party) => (
                        <Link
                            key={party.id}
                            href={`/parties/${party.id}`}
                            className="block rounded border bg-white p-5 transition hover:bg-gray-50"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                    {getBattleRuleLabel(party.rule)}
                                </span>

                                {party.current_version && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                        v{party.current_version.version_number}
                                    </span>
                                )}
                            </div>

                            <h2 className="mt-3 wrap-break-word text-lg font-bold">
                                {party.name}
                            </h2>

                            {party.concept && (
                                <p className="mt-3 wrap-break-word text-sm text-gray-700">
                                    {party.concept}
                                </p>
                            )}

                            {party.memo && (
                                <p className="mt-2 wrap-break-word text-sm text-gray-500">
                                    {party.memo}
                                </p>
                            )}
                        </Link>
                    ))}
                </div>
            </main>
        </>
    );
}
