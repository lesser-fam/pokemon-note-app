"use client";

import { api, getCsrfCookie } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navigationLinks = [
    {
        href: "/parties",
        label: "パーティ一覧",
        className: "text-gray-700 hover:text-black",
    },
    {
        href: "/parties/create",
        label: "パーティ作成",
        className: "rounded bg-black px-4 py-2 text-white",
    },
    {
        href: "/opponent-party-templates",
        label: "相手パーティテンプレート",
        className: "text-gray-700 hover:text-black",
    },
    {
        href: "/common-moves",
        label: "よく使われる技",
        className: "text-gray-700 hover:text-black",
    },
];

export function AppHeader() {
    const router = useRouter();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setIsMenuOpen(false);

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

    const renderNavigationLinks = (linkClassName = "") => (
        <>
            <Link
                href="/help"
                title="ヘルプ"
                aria-label="ヘルプ"
                onClick={() => setIsMenuOpen(false)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-black ${linkClassName}`}
            >
                ?
            </Link>

            {navigationLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`${link.className} ${linkClassName}`}
                >
                    {link.label}
                </Link>
            ))}

            <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`text-gray-600 hover:text-black disabled:opacity-50 ${linkClassName}`}
            >
                {isLoggingOut ? "ログアウト中..." : "ログアウト"}
            </button>
        </>
    );

    return (
        <header className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    <Link href="/parties" className="text-lg font-bold">
                        Matchup Note
                    </Link>

                    <nav className="hidden items-center gap-3 text-sm lg:flex">
                        {renderNavigationLinks()}
                    </nav>

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((current) => !current)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded border text-gray-700 hover:bg-gray-50 lg:hidden"
                        aria-label={
                            isMenuOpen ? "メニューを閉じる" : "メニューを開く"
                        }
                        aria-expanded={isMenuOpen}
                    >
                        <span className="sr-only">
                            {isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
                        </span>
                        <span
                            className="flex flex-col gap-1.5"
                            aria-hidden="true"
                        >
                            <span className="block h-0.5 w-5 rounded bg-current" />
                            <span className="block h-0.5 w-5 rounded bg-current" />
                            <span className="block h-0.5 w-5 rounded bg-current" />
                        </span>
                    </button>
                </div>

                {isMenuOpen && (
                    <nav className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm lg:hidden">
                        {renderNavigationLinks(
                            "w-full justify-start rounded px-3 py-2 text-left hover:bg-gray-50",
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}
