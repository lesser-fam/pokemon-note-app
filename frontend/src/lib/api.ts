import axios from "axios";

/**
 * 開発環境では、ブラウザで開いているホスト名に合わせて
 * Laravel APIの接続先を決める。
 *
 * PC:
 * http://localhost:3000
 * → http://localhost:8081
 *
 * iPhone:
 * http://10.32.1.20:3000
 * → http://10.32.1.20:8081
 *
 * 本番環境ではNEXT_PUBLIC_API_BASE_URLを使用する。
 */
const getApiBaseUrl = (): string => {
    const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (process.env.NODE_ENV === "production") {
        if (!configuredApiBaseUrl) {
            throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
        }

        return configuredApiBaseUrl;
    }

    if (typeof window !== "undefined") {
        return `${window.location.protocol}//${window.location.hostname}:8081`;
    }

    return configuredApiBaseUrl ?? "http://localhost:8081";
};

export const api = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: "application/json",
    },
});

export const getCsrfCookie = async (): Promise<void> => {
    await api.get("/sanctum/csrf-cookie");
};
