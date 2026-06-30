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

export const getApiValidationErrors = (
    error: unknown,
): Record<string, string> => {
    if (!axios.isAxiosError(error)) {
        return {};
    }

    const errors = error.response?.data?.errors;

    if (!errors || typeof errors !== "object") {
        return {};
    }

    return Object.entries(errors).reduce<Record<string, string>>(
        (validationErrors, [field, messages]) => {
            const firstMessage = Array.isArray(messages)
                ? messages.find((message) => typeof message === "string")
                : null;

            if (typeof firstMessage === "string") {
                validationErrors[field] = firstMessage;
            }

            return validationErrors;
        },
        {},
    );
};
