import { PartyRuleBadge } from "@/features/pokemonRules/PartyRuleBadge";
import type { Party } from "@/types/party";
import Link from "next/link";

type PartyDetailHeaderProps = {
    party: Party;
    isDeletingParty: boolean;
    onDeleteParty: () => void;
};

export const PartyDetailHeader = ({
    party,
    isDeletingParty,
    onDeleteParty,
}: PartyDetailHeaderProps) => {
    return (
        <div className="mt-4 rounded border p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <PartyRuleBadge rule={party.rule} />

                        {party.current_version && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                現在のバージョン：v
                                {party.current_version.version_number}
                            </span>
                        )}
                    </div>

                    <h1 className="mt-3 wrap-break-word text-2xl font-bold">
                        {party.name}
                    </h1>
                </div>

                <div className="flex flex-wrap gap-3 md:justify-end">
                    <Link
                        href={`/parties/${party.id}/edit`}
                        className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        パーティ情報を編集
                    </Link>

                    <Link
                        href={`/parties/${party.id}/versions/create`}
                        className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        新バージョン作成
                    </Link>

                    <button
                        type="button"
                        onClick={onDeleteParty}
                        disabled={isDeletingParty}
                        className="rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeletingParty ? "削除中..." : "パーティを削除"}
                    </button>
                </div>
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
    );
};
