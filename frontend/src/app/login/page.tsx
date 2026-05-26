"use client";

import { api, getCsrfCookie } from "@/lib/api";
import { FormEvent, useState } from "react";

export default function LoginPage() {
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
        } catch (error) {
            console.error(error);
            setMessage("ログイン失敗");
        }
    };

    const handleCreateParty = async () => {
        try {
            const response = await api.post("/api/parties", {
                name: "テストパーティ",
                concept: "API確認用のパーティです。",
                memo: "Next.jsからLaravelへPOSTできるか確認しています。",
            });

            console.log(response.data);

            setMessage(`パーティ作成成功：${response.data.data.name}`);
        } catch (error) {
            console.error(error);
            setMessage("パーティ作成失敗");
        }
    };

    const handleFetchParties = async () => {
        try {
            const response = await api.get("/api/parties");

            console.log(response.data);

            setMessage(`パーティ取得成功：${response.data.data.length}件`);
        } catch (error) {
            console.error(error);
            setMessage("パーティ取得失敗");
        }
    };

    const handleFetchPartyDetail = async () => {
        try {
            const response = await api.get("/api/parties/4");

            console.log(response.data);

            setMessage(`パーティ詳細取得成功:${response.data.data.name}`);
        } catch (error) {
            console.log(error);
            setMessage("パーティ詳細取得失敗");
        }
    };
    return (
        <main className="mx-auto max-w-md p-8">
            <h1 className="mb-6 text-2xl font-bold">ログインテスト</h1>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">
                        メールアドレス
                    </label>
                    <input
                        className="mt-1 w-full rounded border p-2"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">
                        パスワード
                    </label>
                    <input
                        className="mt-1 w-full rounded border p-2"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                <button className="rounded bg-black px-4 py-2 text-white">
                    ログイン
                </button>
            </form>

            {message && <p className="mt-4">{message}</p>}

            <div className="mt-6 flex gap-3">
                <button
                    type="button"
                    onClick={handleCreateParty}
                    className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                    テストパーティ作成
                </button>

                <button
                    type="button"
                    onClick={handleFetchParties}
                    className="rounded bg-green-600 px-4 py-2 text-white"
                >
                    パーティ一覧取得
                </button>

                <button
                    type="button"
                    onClick={handleFetchPartyDetail}
                    className="rounded bg-purple-600 px-4 py-2 text-white"
                >
                    パーティ詳細取得
                </button>
            </div>
        </main>
    );
}
