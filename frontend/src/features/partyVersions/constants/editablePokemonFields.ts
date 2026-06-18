import type { EffortValueStatKey } from "@/features/partyPokemon/components/EffortValueEditor";
import type { EditablePokemon } from "../types/editablePokemon";

export const effortValueFieldMap: Record<
    EffortValueStatKey,
    keyof EditablePokemon
> = {
    h: "ev_h",
    a: "ev_a",
    b: "ev_b",
    c: "ev_c",
    d: "ev_d",
    s: "ev_s",
};

export const moveFieldMap = [
    {
        name: "move_1",
        id: "move_1_id",
        type: "move_1_type",
    },
    {
        name: "move_2",
        id: "move_2_id",
        type: "move_2_type",
    },
    {
        name: "move_3",
        id: "move_3_id",
        type: "move_3_type",
    },
    {
        name: "move_4",
        id: "move_4_id",
        type: "move_4_type",
    },
] as const;
