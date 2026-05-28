import Link from "next/link";

export function AppHeader() {
    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/parties" className="text-lg font-bold">
                    自分育成ノート
                </Link>

                <nav className="flex items-center gap-4 text-sm">
                    <Link
                        href="/parties"
                        className="text-gray-700 hover:text-black"
                    >
                        パーティ一覧
                    </Link>

                    <Link
                        href="/parties/create"
                        className="rounded bg-black px-4 py-2 text-white"
                    >
                        パーティ作成
                    </Link>
                </nav>
            </div>
        </header>
    );
}
