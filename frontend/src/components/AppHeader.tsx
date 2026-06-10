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
