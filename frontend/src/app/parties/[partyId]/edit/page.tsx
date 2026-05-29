"use client";

import { AppHeader } from "@/components/AppHeader";
import {
    deleteParty,
    fetchParty,
    updateParty,
} from "@/features/parties/api/partyApi";
import type { Party } from "@/types/party";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function EditPartyPage() {
    const router = useRouter();
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [name, setName] = useState("");
    const [rule, setRule] = useState("main_series");
    const [concept, setConcept] = useState("");
    const [memo, setMemo] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadParty = async () => {
            try {
                const partyData = await fetchParty(partyId);

                setParty(partyData);
                setName(partyData.name);
                setRule(partyData.rule || "main_series");
                setConcept(partyData.concept || "");
                setMemo(partyData.memo || "");
            } catch (error) {
                console.error(error);
                setErrorMessage("パーティ情報の取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (isInvalidPartyId) {
            return;
        }

        loadParty();
    }, [partyId, isInvalidPartyId]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!party) {
            setErrorMessage("パーティが見つかりません。");
            return;
        }

        if (!name.trim()) {
            setErrorMessage("パーティ名を入力してください。");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const updatedParty = await updateParty(party.id, {
                name: name.trim(),
                rule,
                concept: concept.trim() || undefined,
                memo: memo.trim() || undefined,
            });

            router.push(`/parties/${updatedParty.id}`);
        } catch (error) {
            console.error(error);
            setErrorMessage("パーティの更新に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteParty = async () => {
        if (!party) {
            return;
        }

        const confirmed = window.confirm(
            "このパーティを削除します。登録ポケモン、基本選出、対戦ログ、バージョン履歴も削除されます。よろしいですか？",
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        setErrorMessage("");

        try {
            await deleteParty(party.id);
            router.push("/parties");
        } catch (error) {
            console.error(error);
            setErrorMessage("パーティの削除に失敗しました。");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isInvalidPartyId) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-3xl p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        パーティIDが正しくありません。
                    </p>
                </main>
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-3xl p-8">
                    <p>読み込み中...</p>
                </main>
            </>
        );
    }

    if (!party) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-3xl p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        {errorMessage || "パーティが見つかりません。"}
                    </p>
                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-3xl p-8">
                <Link
                    href={`/parties/${party.id}`}
                    className="text-sm text-blue-600"
                >
                    ← パーティ詳細へ戻る
                </Link>

                <div className="mt-4 rounded border p-6">
                    <h1 className="text-2xl font-bold">パーティ編集</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        パーティ名、ルール、コンセプト、メモを編集します。
                    </p>

                    {errorMessage && (
                        <p className="mt-6 rounded bg-red-100 p-3 text-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium">
                                パーティ名
                            </label>
                            <input
                                className="mt-1 w-full rounded border p-3"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                ルール
                            </label>

                            <select
                                className="mt-1 w-full rounded border p-3"
                                value={rule}
                                onChange={(event) =>
                                    setRule(event.target.value)
                                }
                            >
                                <option value="main_series">本編ルール</option>
                                <option value="champions">
                                    チャンピオンズ
                                </option>
                            </select>

                            <p className="mt-2 text-xs text-gray-500">
                                ルールを変更すると、努力値上限の判定も変わります。
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                コンセプト
                            </label>
                            <textarea
                                className="mt-1 w-full rounded border p-3"
                                value={concept}
                                onChange={(event) =>
                                    setConcept(event.target.value)
                                }
                                rows={4}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                メモ
                            </label>
                            <textarea
                                className="mt-1 w-full rounded border p-3"
                                value={memo}
                                onChange={(event) =>
                                    setMemo(event.target.value)
                                }
                                rows={4}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting || isDeleting}
                                className="rounded bg-black px-5 py-3 text-white disabled:opacity-50"
                            >
                                {isSubmitting ? "保存中..." : "保存する"}
                            </button>

                            <Link
                                href={`/parties/${party.id}`}
                                className="rounded border px-5 py-3 text-sm hover:bg-gray-50"
                            >
                                キャンセル
                            </Link>
                        </div>
                    </form>
                </div>

                <section className="mt-8 rounded border border-red-200 bg-red-50 p-6">
                    <h2 className="text-lg font-bold text-red-700">
                        危険な操作
                    </h2>

                    <p className="mt-2 text-sm text-red-700">
                        このパーティを削除すると、登録ポケモン、基本選出、対戦ログ、バージョン履歴も削除されます。
                    </p>

                    <button
                        type="button"
                        onClick={handleDeleteParty}
                        disabled={isSubmitting || isDeleting}
                        className="mt-4 rounded bg-red-600 px-5 py-3 text-white disabled:opacity-50"
                    >
                        {isDeleting ? "削除中..." : "このパーティを削除"}
                    </button>
                </section>
            </main>
        </>
    );
}
