import axios from "axios";

export const getApiErrorMessage = (
    error: unknown,
    fallbackMessage: string,
): string => {
    if (!axios.isAxiosError(error)) {
        return fallbackMessage;
    }

    const errors = error.response?.data?.errors;

    if (!errors || typeof errors !== "object") {
        return fallbackMessage;
    }

    const firstMessage = Object.values(errors)
        .flat()
        .find((message) => typeof message === "string");

    return typeof firstMessage === "string" ? firstMessage : fallbackMessage;
};
