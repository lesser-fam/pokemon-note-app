"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createParty } from "@/features/parties/api/partyApi";
import { AppHeader } from "@/components/AppHeader";

export default function CreatePartyPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [rule, setRule] = useState("main_series");
    const [concept, setConcept] = useState("");
    const [memo, setMemo] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const party = await createParty({
                name,
                rule,
                concept,
                memo,
            });

            router.push(`/parties/${party.id}`);
        } catch (error) {
            console.error(error);
            setErrorMessage("パーティ作成に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-2xl p-8">
                <div>
                    <Link href="/parties" className="text-sm text-blue-600">
                        ← パーティ一覧へ戻る
                    </Link>

                    <h1 className="mt-4 text-2xl font-bold">パーティ作成</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        パーティの大枠を登録します。6匹の登録は次の画面で行います。
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-6"
                    noValidate
                >
                    <div>
                        <label className="block text-sm font-medium">
                            パーティ名
                        </label>
                        <input
                            className="mt-1 w-full rounded border p-3"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="例：メガゲンガー軸"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            対象ルール
                        </label>

                        <select
                            className="mt-1 w-full rounded border p-3"
                            value={rule}
                            onChange={(event) => setRule(event.target.value)}
                        >
                            <option value="main_series">本編ルール</option>
                            <option value="champions">チャンピオンズ</option>
                        </select>

                        <p className="mt-1 text-xs text-gray-500">
                            努力値の上限計算に使います。
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            コンセプト
                        </label>
                        <textarea
                            className="mt-1 w-full rounded border p-3"
                            value={concept}
                            onChange={(event) => setConcept(event.target.value)}
                            placeholder="例：ステロで削って終盤エースを通す"
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
                            onChange={(event) => setMemo(event.target.value)}
                            placeholder="自由メモ"
                            rows={4}
                        />
                    </div>

                    {errorMessage && (
                        <p className="mt-6 rounded bg-red-100 p-3 text-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded bg-black px-5 py-3 text-white disabled:opacity-50"
                    >
                        {isSubmitting ? "作成中..." : "作成する"}
                    </button>
                </form>
            </main>
        </>
    );
}
