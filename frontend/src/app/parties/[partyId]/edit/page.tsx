"use client";

import { AppHeader } from "@/components/AppHeader";
import { fetchParty, updateParty } from "@/features/parties/api/partyApi";
import type { Party } from "@/types/party";
import { getApiErrorMessage, getApiValidationErrors } from "@/utils/apiError";
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
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
            setFieldErrors({ name: "パーティ名を入力してください。" });
            setErrorMessage("パーティ名を入力してください。");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");
        setFieldErrors({});

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
            setFieldErrors(getApiValidationErrors(error));
            setErrorMessage(
                getApiErrorMessage(error, "パーティの更新に失敗しました。"),
            );
        } finally {
            setIsSubmitting(false);
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

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-6"
                        noValidate
                    >
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
                                aria-invalid={Boolean(fieldErrors.name)}
                            />
                            {fieldErrors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {fieldErrors.name}
                                </p>
                            )}
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
                                aria-invalid={Boolean(fieldErrors.rule)}
                            >
                                <option value="main_series">本編ルール</option>
                                <option value="champions">
                                    チャンピオンズ
                                </option>
                            </select>
                            {fieldErrors.rule && (
                                <p className="mt-1 text-sm text-red-600">
                                    {fieldErrors.rule}
                                </p>
                            )}

                            <p className="mt-2 text-xs text-gray-500">
                                ルールを変更すると、努力値上限の判定も変わります。
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                コンセプト
                                <span className="ml-1 text-xs text-gray-500">
                                    任意
                                </span>
                            </label>
                            <textarea
                                className="mt-1 w-full rounded border p-3"
                                value={concept}
                                onChange={(event) =>
                                    setConcept(event.target.value)
                                }
                                rows={4}
                                aria-invalid={Boolean(fieldErrors.concept)}
                            />
                            {fieldErrors.concept && (
                                <p className="mt-1 text-sm text-red-600">
                                    {fieldErrors.concept}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                メモ
                                <span className="ml-1 text-xs text-gray-500">
                                    任意
                                </span>
                            </label>
                            <textarea
                                className="mt-1 w-full rounded border p-3"
                                value={memo}
                                onChange={(event) =>
                                    setMemo(event.target.value)
                                }
                                rows={4}
                                aria-invalid={Boolean(fieldErrors.memo)}
                            />
                            {fieldErrors.memo && (
                                <p className="mt-1 text-sm text-red-600">
                                    {fieldErrors.memo}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
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
            </main>
        </>
    );
}
