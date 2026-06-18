export const hasDuplicatedValues = (
    values: Array<string | null | undefined>,
): boolean => {
    const normalizedValues = values
        .map((value) => value?.trim() ?? "")
        .filter((value) => value !== "");

    return new Set(normalizedValues).size !== normalizedValues.length;
};
