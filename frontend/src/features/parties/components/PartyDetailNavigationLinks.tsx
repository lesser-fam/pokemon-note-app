import Link from "next/link";

type PartyDetailNavigationLinksProps = {
    partyId: number;
};

export const PartyDetailNavigationLinks = ({
    partyId,
}: PartyDetailNavigationLinksProps) => {
    return (
        <div className="mt-6 flex flex-wrap justify-center gap-3 rounded bg-gray-50 px-4 py-4">
            <Link
                href={`/parties/${partyId}/battle-preview`}
                className="rounded bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
                対戦前選出
            </Link>

            <Link
                href={`/parties/${partyId}/selection-practice`}
                className="rounded border border-black bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-gray-100"
            >
                選出練習モード
            </Link>

            <Link
                href={`/opponent-party-templates?partyId=${partyId}`}
                className="rounded border px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white"
            >
                相手パーティテンプレート
            </Link>
        </div>
    );
};
