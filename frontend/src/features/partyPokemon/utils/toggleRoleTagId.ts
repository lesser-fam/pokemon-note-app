import { MAX_ROLE_TAG_COUNT } from "../constants/partyPokemonLimits";

export const toggleRoleTagId = (
    selectedRoleTagIds: number[],
    roleTagId: number,
): number[] => {
    if (selectedRoleTagIds.includes(roleTagId)) {
        return selectedRoleTagIds.filter(
            (selectedRoleTagId) => selectedRoleTagId !== roleTagId,
        );
    }

    if (selectedRoleTagIds.length >= MAX_ROLE_TAG_COUNT) {
        return selectedRoleTagIds;
    }

    return [...selectedRoleTagIds, roleTagId];
};
