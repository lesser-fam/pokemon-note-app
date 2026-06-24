import { AppHeader } from "@/components/AppHeader";
import Link from "next/link";

const usageSteps = [
    {
        title: "1. パーティを作成する",
        body: "パーティ作成画面から、使いたいルールとコンセプトを決めてパーティを作成します。",
        href: "/parties/create",
        linkLabel: "パーティ作成へ",
    },
    {
        title: "2. ポケモン6匹の詳細を登録する",
        body: "パーティ詳細画面で、ポケモン、技、特性、持ち物、性格、努力値、役割タグを登録します。",
        href: "/parties",
        linkLabel: "パーティ一覧へ",
    },
    {
        title: "3. 対戦前選出を開いて対戦へ入る",
        body: "対戦前選出画面で相手パーティを登録し、おすすめ選出βや種族値・特性などの情報を見ながら3匹を考えます。",
    },
    {
        title: "4. バトル後に対戦ログを作成する",
        body: "対戦前選出画面から対戦ログ作成へ進み、勝敗、選出、重かった相手、必要だった味方、反省メモを記録します。",
    },
    {
        title: "5. 対戦ログ一覧・集計で振り返る",
        body: "パーティ詳細画面で、現在バージョンのログとパーティ総合ログを見比べながら改善点を探します。",
    },
    {
        title: "6. 慣れてきたら練習と環境確認を使う",
        body: "勝てない相手が増えてきたら、選出練習、相手パーティテンプレート、よく使われる技を確認して、次の対戦に備えます。",
    },
];

export default function HelpPage() {
    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-5xl p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Matchup Note の使い方</h1>

                    <p className="mt-2 text-sm text-gray-600">
                        ランクマッチで選出を考え、対戦後に振り返り、次の対戦につなげるための基本的な流れです。
                    </p>
                </div>

                <section className="rounded border bg-white p-5">
                    <h2 className="text-lg font-bold">基本の流れ</h2>

                    <div className="mt-4 space-y-3">
                        {usageSteps.map((step) => (
                            <div key={step.title} className="rounded bg-gray-50 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold">{step.title}</h3>

                                        <p className="mt-1 text-sm text-gray-700">
                                            {step.body}
                                        </p>
                                    </div>

                                    {step.href && step.linkLabel && (
                                        <Link
                                            href={step.href}
                                            className="shrink-0 rounded border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                        >
                                            {step.linkLabel}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-3">
                    <Link
                        href="/opponent-party-templates"
                        className="rounded border bg-white p-4 hover:bg-gray-50"
                    >
                        <h2 className="font-bold">相手パーティテンプレート</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            実際に使われやすい相手構築を確認できます。
                        </p>
                    </Link>

                    <Link
                        href="/common-moves"
                        className="rounded border bg-white p-4 hover:bg-gray-50"
                    >
                        <h2 className="font-bold">よく使われる技</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            相手ポケモンごとの警戒技を確認できます。
                        </p>
                    </Link>

                    <Link
                        href="/parties"
                        className="rounded border bg-white p-4 hover:bg-gray-50"
                    >
                        <h2 className="font-bold">パーティ一覧</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            作成済みパーティから対戦前選出やログ確認に進みます。
                        </p>
                    </Link>
                </section>
            </main>
        </>
    );
}
