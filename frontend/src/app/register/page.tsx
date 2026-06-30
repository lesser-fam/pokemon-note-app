"use client";

import { api, getCsrfCookie } from "@/lib/api";
import { getApiErrorMessage } from "@/utils/apiError";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await getCsrfCookie();

            await api.post("/api/register", {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            router.push("/parties");
        } catch (error) {
            console.error(error);

            setErrorMessage(
                getApiErrorMessage(error, "ユーザー登録に失敗しました。"),
            );
        } finally {
            setIsSubmitting(false);
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
                        新しいアカウントを作成します。
                    </p>
                </div>

                <form
                    onSubmit={handleRegister}
                    className="space-y-4"
                    noValidate
                >
                    <div>
                        <label className="block text-sm font-medium">
                            名前
                        </label>

                        <input
                            className="mt-1 w-full rounded border p-3"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            autoComplete="name"
                        />
                    </div>

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
                            autoComplete="new-password"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            8文字以上で入力してください。
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            パスワード確認
                        </label>

                        <input
                            className="mt-1 w-full rounded border p-3"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(event) =>
                                setPasswordConfirmation(event.target.value)
                            }
                            autoComplete="new-password"
                        />
                    </div>

                    {errorMessage && (
                        <p className="mt-4 rounded bg-red-100 p-3 text-sm text-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
                    >
                        {isSubmitting ? "登録中..." : "ユーザー登録"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    すでにアカウントを持っている場合は
                    <Link href="/login" className="ml-1 text-blue-600">
                        ログイン
                    </Link>
                </p>
            </div>
        </main>
    );
}
