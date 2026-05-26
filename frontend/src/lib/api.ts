import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: "application/json",
    },
});

export const getCsrfCookie = async () => {
    await api.get("/sanctum/csrf-cookie");
};
