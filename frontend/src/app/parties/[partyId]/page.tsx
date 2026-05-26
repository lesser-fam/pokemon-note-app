"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchParty } from "@/features/parties/api/partyApi";
import type { Party } from "@/types/party";

export default function PartyDetailPage() {
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadParty = async () => {
            try {
                const data = await fetchParty(partyId);
                setParty(data);
            } catch (error) {
                console.error(error);
                setErrorMessage("パーティ詳細の取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (!Number.isNaN(partyId)) {
            loadParty();
        }
    }, [partyId]);

    if (isLoading) {
        return (
            <main className="mx-auto max-w-5xl p-8">
                <p>読み込み中...</p>
            </main>
        );
    }

    if (errorMessage || !party) {
        return (
            <main className="mx-auto max-w-5xl p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    {errorMessage || "パーティが見つかりません。"}
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl p-8">
            <Link href="/parties" className="text-sm text-blue-600">
                ← パーティ一覧へ戻る
            </Link>

            <div className="mt-4 rounded border p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{party.name}</h1>

                    {party.current_version && (
                        <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                            現在のバージョン：v
                            {party.current_version.version_number}
                        </span>
                    )}
                </div>

                {party.concept && (
                    <div className="mt-6">
                        <h2 className="font-semibold">コンセプト</h2>
                        <p className="mt-1 text-gray-700">{party.concept}</p>
                    </div>
                )}

                {party.memo && (
                    <div className="mt-6">
                        <h2 className="font-semibold">メモ</h2>
                        <p className="mt-1 text-gray-700">{party.memo}</p>
                    </div>
                )}
            </div>

            <section className="mt-8 rounded border p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">登録ポケモン</h2>

                    <button className="rounded bg-black px-4 py-2 text-white">
                        ポケモンを追加
                    </button>
                </div>

                <p className="mt-4 text-gray-600">
                    まだポケモン登録画面は未実装です。次のフェーズで作成します。
                </p>
            </section>

            <section className="mt-8 rounded border p-6">
                <h2 className="text-xl font-bold">バージョン履歴</h2>

                <div className="mt-4 space-y-3">
                    {party.versions?.map((version) => (
                        <div
                            key={version.id}
                            className="rounded bg-gray-50 p-4"
                        >
                            <p className="font-semibold">
                                v{version.version_number}
                                {version.is_current && "（現在）"}
                            </p>
                            {version.change_note && (
                                <p className="mt-1 text-sm text-gray-600">
                                    {version.change_note}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
