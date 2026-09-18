"use client";

import type { Party } from "@/types/party";
import Link from "next/link";
import { useState } from "react";

type PartyDuplicateActionProps = {
    party: Party;
    canDuplicateParty: boolean;
};

export const PartyDuplicateAction = ({
    party,
    canDuplicateParty,
}: PartyDuplicateActionProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                disabled={!canDuplicateParty}
                className="rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                パーティを複製
            </button>

            {isDialogOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setIsDialogOpen(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="duplicate-party-dialog-title"
                        className="w-full min-w-0 max-w-md rounded-lg bg-white p-5 shadow-xl sm:p-6"
                    >
                        <h2
                            id="duplicate-party-dialog-title"
                            className="text-lg font-bold"
                        >
                            パーティを複製しますか？
                        </h2>

                        <div className="mt-3 space-y-2 wrap-break-word text-sm text-gray-700">
                            <p>
                                現在のパーティに登録されている6匹を使って、新しいパーティを作成します。
                            </p>
                            <p>
                                元のパーティや対戦ログは変更されません。新しいパーティは、このパーティと同じルールで作成されます。
                            </p>
                            <p>
                                ポケモンの構築情報はコピーされますが、対戦ログや保存済み基本選出はコピーされません。
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsDialogOpen(false)}
                                className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                            >
                                キャンセル
                            </button>
                            <Link
                                href={`/parties/${party.id}/duplicate`}
                                className="rounded bg-black px-4 py-2 text-center text-sm text-white hover:bg-gray-800"
                            >
                                複製を続ける
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
