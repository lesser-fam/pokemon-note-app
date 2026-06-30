"use client";

import { api, getCsrfCookie } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getApiErrorMessage } from "@/utils/apiError";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await getCsrfCookie();

            await api.post("/api/login", {
                email,
                password,
            });

            const response = await api.get("/api/user");

            setMessage(`ログイン成功：${response.data.user.name}`);

            router.push("/parties");
        } catch (error) {
            console.error(error);

            setMessage(getApiErrorMessage(error, "ログインに失敗しました。"));
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md rounded bg-white p-8 shadow">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-block text-2xl font-bold">
                        Matchup Note
                    </Link>
                    <p className="mt-2 text-sm text-gray-600">
                        ポケモン対戦の選出と反省を記録する学習支援アプリ
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium">
                            メールアドレス
                        </label>
                        <input
                            className="mt-1 w-full rounded border p-3"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            パスワード
                        </label>
                        <input
                            className="mt-1 w-full rounded border p-3"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="current-password"
                        />
                    </div>

                    {message && (
                        <p className="mt-4 rounded bg-red-100 p-3 text-sm text-red-700">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded bg-black px-4 py-3 text-white"
                    >
                        ログイン
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    アカウントを持っていない場合は
                    <Link href="/register" className="ml-1 text-blue-600">
                        ユーザー登録
                    </Link>
                </p>
            </div>
        </main>
    );
}
