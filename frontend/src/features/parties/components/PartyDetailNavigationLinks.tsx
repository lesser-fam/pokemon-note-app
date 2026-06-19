import Link from "next/link";

type PartyDetailNavigationLinksProps = {
    partyId: number;
};

export const PartyDetailNavigationLinks = ({
    partyId,
}: PartyDetailNavigationLinksProps) => {
    return (
        <div className="mt-4 flex flex-wrap gap-2">
            <Link
                href={`/parties/${partyId}/battle-preview`}
                className="rounded border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            >
                対戦前選出
            </Link>

            <Link
                href={`/parties/${partyId}/selection-practice`}
                className="rounded border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            >
                選出練習モード
            </Link>

            <Link
                href={`/opponent-party-templates?partyId=${partyId}`}
                className="rounded border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            >
                相手パーティテンプレート
            </Link>
        </div>
    );
};
