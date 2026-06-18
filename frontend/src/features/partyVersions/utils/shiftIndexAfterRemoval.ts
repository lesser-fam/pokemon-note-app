export const shiftIndexAfterRemoval = (
    currentIndex: number | null,
    removedIndex: number,
): number | null => {
    if (currentIndex === null || currentIndex === removedIndex) {
        return null;
    }

    if (currentIndex > removedIndex) {
        return currentIndex - 1;
    }

    return currentIndex;
};
