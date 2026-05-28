"use client";

import { api, getCsrfCookie } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("password");
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
            setMessage("ログイン失敗");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md rounded bg-white p-8 shadow">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold">自分育成ノート</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        ポケモン対戦の選出と反省を記録する学習支援アプリ
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">
                            メールアドレス
                        </label>
                        <input
                            className="mt-1 w-full rounded border p-3"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
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
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded bg-black px-4 py-3 text-white"
                    >
                        ログイン
                    </button>
                </form>

                {message && (
                    <p className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-700">
                        {message}
                    </p>
                )}
            </div>
        </main>
    );
}
