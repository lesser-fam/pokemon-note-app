"use client";

import { AppHeader } from "@/components/AppHeader";
import { PageStateMessage } from "@/components/pageStates/PageStateMessage";
import {
    duplicateParty,
    fetchParty,
} from "@/features/parties/api/partyApi";
import { getPartyRuleConfig } from "@/features/pokemonRules/partyRuleConfig";
import type { Party } from "@/types/party";
import { getApiErrorMessage, getApiValidationErrors } from "@/utils/apiError";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function DuplicatePartyPage() {
    const params = useParams<{ partyId: string }>();
    const router = useRouter();
    const sourcePartyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(sourcePartyId);
    const isSubmittingRef = useRef(false);

    const [sourceParty, setSourceParty] = useState<Party | null>(null);
    const [name, setName] = useState("");
    const [concept, setConcept] = useState("");
    const [memo, setMemo] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loadErrorMessage, setLoadErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(!isInvalidPartyId);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isInvalidPartyId) {
            return;
        }

        const loadSourceParty = async () => {
            try {
                const party = await fetchParty(sourcePartyId);

                setSourceParty(party);
                setConcept(party.concept ?? "");
                setMemo(party.memo ?? "");
            } catch (error) {
                console.error(error);
                setLoadErrorMessage("複製元のパーティを取得できませんでした。");
            } finally {
                setIsLoading(false);
            }
        };

        loadSourceParty();
    }, [isInvalidPartyId, sourcePartyId]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!sourceParty || isSubmittingRef.current) {
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setErrorMessage("");
        setFieldErrors({});

        try {
            const duplicatedParty = await duplicateParty(sourceParty.id, {
                name,
                concept,
                memo,
            });

            router.push(`/parties/${duplicatedParty.id}`);
        } catch (error) {
            console.error(error);

            const validationErrors = getApiValidationErrors(error);

            setFieldErrors(validationErrors);
            setErrorMessage(
                Object.keys(validationErrors).length > 0
                    ? ""
                    : getApiErrorMessage(
                          error,
                          "パーティの複製に失敗しました。",
                      ),
            );
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    };

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

    if (loadErrorMessage || !sourceParty) {
        return (
            <PageStateMessage
                message={loadErrorMessage || "パーティが見つかりません。"}
                variant="error"
            />
        );
    }

    const sourcePokemonCount = sourceParty.current_version?.pokemon?.length ?? 0;

    if (sourcePokemonCount !== 6) {
        return (
            <>
                <AppHeader />
                <main className="mx-auto w-full max-w-2xl p-4 sm:p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        パーティを複製するには、現在のバージョンにポケモンを6匹登録してください。
                    </p>
                    <Link
                        href={`/parties/${sourceParty.id}`}
                        className="mt-4 inline-block text-sm text-blue-600"
                    >
                        ← 元のパーティ詳細へ戻る
                    </Link>
                </main>
            </>
        );
    }

    const ruleConfig = getPartyRuleConfig(sourceParty.rule);

    return (
        <>
            <AppHeader />

            <main className="mx-auto w-full max-w-2xl p-4 sm:p-8">
                <div>
                    <Link
                        href={`/parties/${sourceParty.id}`}
                        className="text-sm text-blue-600"
                    >
                        ← 元のパーティ詳細へ戻る
                    </Link>

                    <h1 className="mt-4 wrap-break-word text-2xl font-bold">
                        パーティを複製
                    </h1>
                    <p className="mt-1 wrap-break-word text-sm text-gray-600">
                        「{sourceParty.name}」の6匹と構築情報を使って、新しいパーティを作成します。
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
                            placeholder="新しいパーティ名"
                            aria-invalid={Boolean(fieldErrors.name)}
                            disabled={isSubmitting}
                        />
                        {fieldErrors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {fieldErrors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="block text-sm font-medium">対象ルール</p>
                        <div className="mt-1 rounded border bg-gray-50 p-3 text-gray-700">
                            {ruleConfig.label}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            複製元と同じルールで作成されます。変更はできません。
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
                            onChange={(event) => setConcept(event.target.value)}
                            rows={4}
                            disabled={isSubmitting}
                        />
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
                            onChange={(event) => setMemo(event.target.value)}
                            rows={4}
                            disabled={isSubmitting}
                        />
                    </div>

                    {errorMessage && (
                        <p className="rounded bg-red-100 p-3 text-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href={`/parties/${sourceParty.id}`}
                            className="rounded border px-5 py-3 text-center hover:bg-gray-50"
                            aria-disabled={isSubmitting}
                            onClick={(event) => {
                                if (isSubmitting) {
                                    event.preventDefault();
                                }
                            }}
                        >
                            キャンセル
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? "複製中..." : "複製して作成"}
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}
