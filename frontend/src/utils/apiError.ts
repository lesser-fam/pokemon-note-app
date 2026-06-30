import axios from "axios";

export const getApiErrorMessage = (
    error: unknown,
    fallbackMessage: string,
): string => {
    if (!axios.isAxiosError(error)) {
        return fallbackMessage;
    }

    const responseData = error.response?.data;
    const errors = responseData?.errors;

    if (errors && typeof errors === "object") {
        const firstMessage = Object.values(errors)
            .flat()
            .find((message) => typeof message === "string");

        if (typeof firstMessage === "string") {
            return firstMessage;
        }
    }

    return typeof responseData?.message === "string"
        ? responseData.message
        : fallbackMessage;
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
