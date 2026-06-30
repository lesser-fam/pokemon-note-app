import Link from "next/link";

const usageSteps = [
    "パーティを作成し、6匹の型や役割を登録",
    "対戦前に相手パーティを入力して選出を検討",
    "対戦後にログを残し、勝敗や重かった相手を振り返り",
    "ログ集計や選出練習を使って次の対戦に備える",
];

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
            <div className="mx-auto flex max-w-5xl flex-col gap-12">
                <section className="rounded border bg-white p-8 shadow-sm md:p-12">
                    <p className="text-sm font-semibold text-gray-500">
                        ポケモン対戦の選出・記録・振り返りをひとつに
                    </p>

                    <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                        Matchup Note
                    </h1>

                    <p className="mt-6 max-w-3xl leading-8 text-gray-700">
                        Matchup Noteは、ポケモン対戦で悩みやすい選出判断と、
                        対戦後の振り返りを支援する学習用アプリです。
                        パーティの型、対戦前の相手情報、対戦ログ、集計をまとめて管理できます。
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/register"
                            className="rounded bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                            新規登録
                        </Link>

                        <Link
                            href="/login"
                            className="rounded border px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                        >
                            ログイン
                        </Link>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold">使い方</h2>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {usageSteps.map((step, index) => (
                            <div
                                key={step}
                                className="rounded border bg-white p-5 shadow-sm"
                            >
                                <p className="text-sm font-semibold text-gray-500">
                                    Step {index + 1}
                                </p>

                                <p className="mt-2 font-medium leading-7">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}