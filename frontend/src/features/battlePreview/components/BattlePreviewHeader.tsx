import Link from "next/link";

type BattlePreviewHeaderProps = {
    partyId: number;
};

export const BattlePreviewHeader = ({ partyId }: BattlePreviewHeaderProps) => {
    return (
        <section className="rounded border bg-white px-3 py-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Link
                    href={`/parties/${partyId}`}
                    className="text-xs text-blue-600"
                >
                    ← パーティ詳細へ戻る
                </Link>

                <h1 className="text-base font-bold">対戦前選出</h1>

                <p className="text-xs text-gray-500">
                    相手の6匹を入力して、選出判断の準備をします。
                </p>
            </div>
        </section>
    );
};
