import { useState } from "react";

import type { NatureMaster } from "@/types/battleMaster";

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

        updateEffortValue,
        updateMove,
    };
};
