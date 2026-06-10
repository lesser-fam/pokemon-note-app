"use client";

import { api } from "@/lib/api";
import axios from "axios";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

type PartiesLayoutProps = {
    children: ReactNode;
};

export default function PartiesLayout({ children }: PartiesLayoutProps) {
    const router = useRouter();

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isCancelled = false;

        const checkAuthentication = async () => {
            try {
                await api.get("/api/user");

                if (!isCancelled) {
                    setIsCheckingAuth(false);
                }
            } catch (error) {
                console.error(error);

                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 401
                ) {
                    router.replace("/login");

                    return;
                }

                if (!isCancelled) {
                    setErrorMessage("ログイン状態の確認に失敗しました。");

                    setIsCheckingAuth(false);
                }
            }
        };

        checkAuthentication();

        return () => {
            isCancelled = true;
        };
    }, [router]);

    if (isCheckingAuth) {
        return (
            <main className="mx-auto max-w-6xl p-8">
                <p>ログイン状態を確認中...</p>
            </main>
        );
    }

    if (errorMessage) {
        return (
            <main className="mx-auto max-w-6xl p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    {errorMessage}
                </p>
            </main>
        );
    }

    return children;
}
