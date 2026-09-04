"use client";

import { AppHeader } from "@/components/AppHeader";
import { fetchParties } from "@/features/parties/api/partyApi";
import type { Party } from "@/types/party";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PartyRuleBadge } from "@/features/pokemonRules/PartyRuleBadge";

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

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-7xl p-4 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
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
                            className="flex min-h-64 min-w-0 flex-col rounded border bg-white p-5 transition hover:bg-gray-50"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <PartyRuleBadge rule={party.rule} />

                                {party.current_version && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                        v{party.current_version.version_number}
                                    </span>
                                )}
                            </div>

                            <h2
                                className="mt-3 truncate text-lg font-bold"
                                title={party.name}
                            >
                                {party.name}
                            </h2>

                            {party.concept && (
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-400">
                                        コンセプト
                                    </p>

                                    <p
                                        className="mt-1 line-clamp-2 break-words text-sm text-gray-700"
                                        title={party.concept}
                                    >
                                        {party.concept}
                                    </p>
                                </div>
                            )}

                            {party.memo && (
                                <div className="mt-3">
                                    <p className="text-xs font-semibold text-gray-400">
                                        メモ
                                    </p>

                                    <p
                                        className="mt-1 line-clamp-2 break-words text-sm text-gray-500"
                                        title={party.memo}
                                    >
                                        {party.memo}
                                    </p>
                                </div>
                            )}

                            {!party.concept && !party.memo && (
                                <p className="mt-4 text-sm text-gray-400">
                                    コンセプト・メモは未登録です。
                                </p>
                            )}

                            <p className="mt-auto pt-5 text-right text-sm font-medium text-blue-600">
                                詳細を見る →
                            </p>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    );
}
