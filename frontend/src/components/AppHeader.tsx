"use client";

import { api, getCsrfCookie } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AppHeader() {
    const router = useRouter();

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await getCsrfCookie();

            await api.post("/api/logout");

            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error(error);

            window.alert("ログアウトに失敗しました。");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
                <Link href="/parties" className="text-lg font-bold">
                    Matchup Note
                </Link>

                <nav className="flex flex-wrap items-center gap-3 text-sm">
                    <Link
                        href="/help"
                        title="ヘルプ"
                        aria-label="ヘルプ"
                        className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-black"
                    >
                        ?
                    </Link>

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

                    <Link
                        href="/opponent-party-templates"
                        className="text-gray-700 hover:text-black"
                    >
                        相手パーティテンプレート
                    </Link>

                    <Link
                        href="/common-moves"
                        className="text-gray-700 hover:text-black"
                    >
                        よく使われる技
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="text-gray-600 hover:text-black disabled:opacity-50"
                    >
                        {isLoggingOut ? "ログアウト中..." : "ログアウト"}
                    </button>
                </nav>
            </div>
        </header>
    );
}
