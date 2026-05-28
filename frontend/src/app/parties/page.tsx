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

                <div className="mt-8 grid gap-4">
                    {parties.map((party) => (
                        <Link
                            key={party.id}
                            href={`/parties/${party.id}`}
                            className="rounded border p-5 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    {party.name}
                                </h2>

                                {party.current_version && (
                                    <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                                        v{party.current_version.version_number}
                                    </span>
                                )}
                            </div>

                            {party.concept && (
                                <p className="mt-2 text-sm text-gray-700">
                                    {party.concept}
                                </p>
                            )}

                            {party.memo && (
                                <p className="mt-2 text-sm text-gray-500">
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
