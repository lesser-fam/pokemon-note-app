import type { NatureMaster } from "@/types/battleMaster";
import { useState } from "react";

type EditableMove = {
    name: string;
    id: number | null;
    type: string;
};

type EditableMoves = [EditableMove, EditableMove, EditableMove, EditableMove];

type ValidationEffortValues = [number, number, number, number, number, number];

export const usePartyPokemonForm = () => {
    const [nickname, setNickname] = useState("");

    const [item, setItem] = useState("");
    const [itemId, setItemId] = useState<number | null>(null);

    const [ability, setAbility] = useState("");
    const [abilityId, setAbilityId] = useState<number | null>(null);

    const [nature, setNature] = useState("");
    const [natureId, setNatureId] = useState<number | null>(null);
    const [selectedNatureMaster, setSelectedNatureMaster] =
        useState<NatureMaster | null>(null);

    const [evH, setEvH] = useState("0");
    const [evA, setEvA] = useState("0");
    const [evB, setEvB] = useState("0");
    const [evC, setEvC] = useState("0");
    const [evD, setEvD] = useState("0");
    const [evS, setEvS] = useState("0");

    const [move1, setMove1] = useState("");
    const [move1Id, setMove1Id] = useState<number | null>(null);
    const [move1Type, setMove1Type] = useState("");

    const [move2, setMove2] = useState("");
    const [move2Id, setMove2Id] = useState<number | null>(null);
    const [move2Type, setMove2Type] = useState("");

    const [move3, setMove3] = useState("");
    const [move3Id, setMove3Id] = useState<number | null>(null);
    const [move3Type, setMove3Type] = useState("");

    const [move4, setMove4] = useState("");
    const [move4Id, setMove4Id] = useState<number | null>(null);
    const [move4Type, setMove4Type] = useState("");

    const [memo, setMemo] = useState("");

    const resetAbility = () => {
        setAbility("");
        setAbilityId(null);
    };

    const updateEffortValue = (
        statKey: "h" | "a" | "b" | "c" | "d" | "s",
        value: string,
    ) => {
        const setterMap = {
            h: setEvH,
            a: setEvA,
            b: setEvB,
            c: setEvC,
            d: setEvD,
            s: setEvS,
        };

        setterMap[statKey](value);
    };

    const updateMove = (
        moveIndex: number,
        move: {
            name: string;
            id: number | null;
            type: string;
        },
    ) => {
        const setterList = [
            {
                setName: setMove1,
                setId: setMove1Id,
                setType: setMove1Type,
            },
            {
                setName: setMove2,
                setId: setMove2Id,
                setType: setMove2Type,
            },
            {
                setName: setMove3,
                setId: setMove3Id,
                setType: setMove3Type,
            },
            {
                setName: setMove4,
                setId: setMove4Id,
                setType: setMove4Type,
            },
        ];

        const setter = setterList[moveIndex];

        if (!setter) {
            return;
        }

        setter.setName(move.name);
        setter.setId(move.id);
        setter.setType(move.type);
    };

    const effortValues = {
        h: evH,
        a: evA,
        b: evB,
        c: evC,
        d: evD,
        s: evS,
    };

    const moves: EditableMoves = [
        {
            name: move1,
            id: move1Id,
            type: move1Type,
        },
        {
            name: move2,
            id: move2Id,
            type: move2Type,
        },
        {
            name: move3,
            id: move3Id,
            type: move3Type,
        },
        {
            name: move4,
            id: move4Id,
            type: move4Type,
        },
    ];

    const toNumber = (value: string) => {
        return Number(value || 0);
    };

    const createRequestPokemon = (
        pokemonKey: string,
        formKey: string,
        selectedRoleTagIds: number[],
    ) => {
        return {
            pokemon_key: pokemonKey,
            form_key: formKey,
            nickname,

            item,
            item_id: itemId,

            ability,
            ability_id: abilityId,

            nature,
            nature_id: natureId,

            ev_h: toNumber(evH),
            ev_a: toNumber(evA),
            ev_b: toNumber(evB),
            ev_c: toNumber(evC),
            ev_d: toNumber(evD),
            ev_s: toNumber(evS),

            move_1: move1,
            move_1_id: move1Id,
            move_1_type: move1Type || undefined,

            move_2: move2,
            move_2_id: move2Id,
            move_2_type: move2Type || undefined,

            move_3: move3,
            move_3_id: move3Id,
            move_3_type: move3Type || undefined,

            move_4: move4,
            move_4_id: move4Id,
            move_4_type: move4Type || undefined,

            memo,
            role_tag_ids: selectedRoleTagIds,
        };
    };

    const validateEffortValues: ValidationEffortValues = [
        toNumber(evH),
        toNumber(evA),
        toNumber(evB),
        toNumber(evC),
        toNumber(evD),
        toNumber(evS),
    ];

    return {
        nickname,
        setNickname,

        item,
        setItem,
        itemId,
        setItemId,

        ability,
        setAbility,
        abilityId,
        setAbilityId,
        resetAbility,

        nature,
        setNature,
        natureId,
        setNatureId,
        selectedNatureMaster,
        setSelectedNatureMaster,

        evH,
        setEvH,
        evA,
        setEvA,
        evB,
        setEvB,
        evC,
        setEvC,
        evD,
        setEvD,
        evS,
        setEvS,

        move1,
        setMove1,
        move1Id,
        setMove1Id,
        move1Type,
        setMove1Type,

        move2,
        setMove2,
        move2Id,
        setMove2Id,
        move2Type,
        setMove2Type,

        move3,
        setMove3,
        move3Id,
        setMove3Id,
        move3Type,
        setMove3Type,

        move4,
        setMove4,
        move4Id,
        setMove4Id,
        move4Type,
        setMove4Type,

        memo,
        setMemo,

        effortValues,
        moves,

        updateEffortValue,
        updateMove,

        createRequestPokemon,

        validateEffortValues,
    };
};
