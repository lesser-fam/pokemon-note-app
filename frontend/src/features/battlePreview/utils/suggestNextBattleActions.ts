import type { MoveMaster } from "@/types/battleMaster";
import type { PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";

type StatKey = "h" | "a" | "b" | "c" | "d" | "s";

type BattleActionKind = "move" | "switch";

export type SuggestedBattleAction = {
    kind: BattleActionKind;
    label: string;
    score: number;
    reasonList: string[];
    targetPartyPokemonId?: number;
};

type BattleMoveCandidate = {
    name: string;
    type: string | null;
    damageClass: MoveMaster["damage_class"] | null;
    power: number | null;
};

type SuggestNextBattleActionsInput = {
    ownPartyPokemon: PartyPokemon;
    ownPokemonMaster: Pokemon;
    opponentPokemon: Pokemon;
    partyPokemonList: PartyPokemon[];
    pokemonMasterList: Pokemon[];
    selectedPartyPokemonIds: number[];
};

const typeEffectivenessChart: Record<string, Record<string, number>> = {
    ノーマル: {
        いわ: 0.5,
        ゴースト: 0,
        はがね: 0.5,
    },
    ほのお: {
        ほのお: 0.5,
        みず: 0.5,
        くさ: 2,
        こおり: 2,
        むし: 2,
        いわ: 0.5,
        ドラゴン: 0.5,
        はがね: 2,
    },
    みず: {
        ほのお: 2,
        みず: 0.5,
        くさ: 0.5,
        じめん: 2,
        いわ: 2,
        ドラゴン: 0.5,
    },
    でんき: {
        みず: 2,
        でんき: 0.5,
        くさ: 0.5,
        じめん: 0,
        ひこう: 2,
        ドラゴン: 0.5,
    },
    くさ: {
        ほのお: 0.5,
        みず: 2,
        くさ: 0.5,
        どく: 0.5,
        じめん: 2,
        ひこう: 0.5,
        むし: 0.5,
        いわ: 2,
        ドラゴン: 0.5,
        はがね: 0.5,
    },
    こおり: {
        ほのお: 0.5,
        みず: 0.5,
        くさ: 2,
        こおり: 0.5,
        じめん: 2,
        ひこう: 2,
        ドラゴン: 2,
        はがね: 0.5,
    },
    かくとう: {
        ノーマル: 2,
        こおり: 2,
        どく: 0.5,
        ひこう: 0.5,
        エスパー: 0.5,
        むし: 0.5,
        いわ: 2,
        ゴースト: 0,
        あく: 2,
        はがね: 2,
        フェアリー: 0.5,
    },
    どく: {
        くさ: 2,
        どく: 0.5,
        じめん: 0.5,
        いわ: 0.5,
        ゴースト: 0.5,
        はがね: 0,
        フェアリー: 2,
    },
    じめん: {
        ほのお: 2,
        でんき: 2,
        くさ: 0.5,
        どく: 2,
        ひこう: 0,
        むし: 0.5,
        いわ: 2,
        はがね: 2,
    },
    ひこう: {
        でんき: 0.5,
        くさ: 2,
        かくとう: 2,
        むし: 2,
        いわ: 0.5,
        はがね: 0.5,
    },
    エスパー: {
        かくとう: 2,
        どく: 2,
        エスパー: 0.5,
        あく: 0,
        はがね: 0.5,
    },
    むし: {
        ほのお: 0.5,
        くさ: 2,
        かくとう: 0.5,
        どく: 0.5,
        ひこう: 0.5,
        エスパー: 2,
        ゴースト: 0.5,
        あく: 2,
        はがね: 0.5,
        フェアリー: 0.5,
    },
    いわ: {
        ほのお: 2,
        こおり: 2,
        かくとう: 0.5,
        じめん: 0.5,
        ひこう: 2,
        むし: 2,
        はがね: 0.5,
    },
    ゴースト: {
        ノーマル: 0,
        エスパー: 2,
        ゴースト: 2,
        あく: 0.5,
    },
    ドラゴン: {
        ドラゴン: 2,
        はがね: 0.5,
        フェアリー: 0,
    },
    あく: {
        かくとう: 0.5,
        エスパー: 2,
        ゴースト: 2,
        あく: 0.5,
        フェアリー: 0.5,
    },
    はがね: {
        ほのお: 0.5,
        みず: 0.5,
        でんき: 0.5,
        こおり: 2,
        いわ: 2,
        はがね: 0.5,
        フェアリー: 2,
    },
    フェアリー: {
        ほのお: 0.5,
        かくとう: 2,
        どく: 0.5,
        ドラゴン: 2,
        あく: 2,
        はがね: 0.5,
    },
};

const getTypeEffectiveness = (
    moveType: string | null,
    defenderTypes: string[],
): number => {
    if (!moveType) {
        return 1;
    }

    return defenderTypes.reduce((multiplier, defenderType) => {
        return (
            multiplier * (typeEffectivenessChart[moveType]?.[defenderType] ?? 1)
        );
    }, 1);
};

const getDefensiveMultiplier = (
    defenderTypes: string[],
    attackTypes: string[],
): number => {
    if (attackTypes.length === 0) {
        return 1;
    }

    return Math.max(
        ...attackTypes.map((attackType) =>
            getTypeEffectiveness(attackType, defenderTypes),
        ),
    );
};

const getNatureMultiplier = (
    partyPokemon: PartyPokemon,
    statKey: StatKey,
): number => {
    const increasedStat = partyPokemon.nature_master?.increased_stat;
    const decreasedStat = partyPokemon.nature_master?.decreased_stat;

    if (increasedStat === statKey) {
        return 1.1;
    }

    if (decreasedStat === statKey) {
        return 0.9;
    }

    return 1;
};

const getApproxStat = (
    pokemon: Pokemon,
    statKey: StatKey,
    ev = 0,
    natureMultiplier = 1,
): number => {
    const base = pokemon.base_stats[statKey];

    if (statKey === "h") {
        return Math.floor(base * 2 + Math.floor(ev / 4) + 60);
    }

    return Math.floor((base * 2 + Math.floor(ev / 4) + 5) * natureMultiplier);
};

const getOwnApproxStat = (
    partyPokemon: PartyPokemon,
    pokemon: Pokemon,
    statKey: StatKey,
): number => {
    const evMap: Record<StatKey, number> = {
        h: partyPokemon.ev_h,
        a: partyPokemon.ev_a,
        b: partyPokemon.ev_b,
        c: partyPokemon.ev_c,
        d: partyPokemon.ev_d,
        s: partyPokemon.ev_s,
    };

    return getApproxStat(
        pokemon,
        statKey,
        evMap[statKey],
        getNatureMultiplier(partyPokemon, statKey),
    );
};

const getMoveCandidates = (
    partyPokemon: PartyPokemon,
): BattleMoveCandidate[] => {
    return [
        {
            name: partyPokemon.move_1,
            type: partyPokemon.move_1_type,
            damageClass: partyPokemon.move1_master?.damage_class ?? null,
            power: partyPokemon.move1_master?.power ?? null,
        },
        {
            name: partyPokemon.move_2,
            type: partyPokemon.move_2_type,
            damageClass: partyPokemon.move2_master?.damage_class ?? null,
            power: partyPokemon.move2_master?.power ?? null,
        },
        {
            name: partyPokemon.move_3,
            type: partyPokemon.move_3_type,
            damageClass: partyPokemon.move3_master?.damage_class ?? null,
            power: partyPokemon.move3_master?.power ?? null,
        },
        {
            name: partyPokemon.move_4,
            type: partyPokemon.move_4_type,
            damageClass: partyPokemon.move4_master?.damage_class ?? null,
            power: partyPokemon.move4_master?.power ?? null,
        },
    ].filter((move): move is BattleMoveCandidate & { name: string } =>
        Boolean(move.name),
    );
};

const getStatusMoveScore = (
    moveName: string,
): {
    score: number;
    reasonList: string[];
} => {
    const reasonList: string[] = [];

    if (["おにび", "でんじは", "あくび", "ステルスロック"].includes(moveName)) {
        reasonList.push("展開作りや相手の行動制限につながる補助技です。");

        return {
            score: 42,
            reasonList,
        };
    }

    if (["まもる", "みがわり"].includes(moveName)) {
        reasonList.push("様子見や相手の行動確認に使いやすい補助技です。");

        return {
            score: 34,
            reasonList,
        };
    }

    reasonList.push("補助技なので、ダメージより展開作りを重視する選択肢です。");

    return {
        score: 28,
        reasonList,
    };
};

const getDamageClassLabel = (
    damageClass: MoveMaster["damage_class"] | null,
): string => {
    if (damageClass === "physical") {
        return "物理";
    }

    if (damageClass === "special") {
        return "特殊";
    }

    return "変化";
};

const evaluateMove = ({
    move,
    ownPartyPokemon,
    ownPokemonMaster,
    opponentPokemon,
}: {
    move: BattleMoveCandidate;
    ownPartyPokemon: PartyPokemon;
    ownPokemonMaster: Pokemon;
    opponentPokemon: Pokemon;
}): SuggestedBattleAction => {
    const reasonList: string[] = [];

    if (move.damageClass === "status") {
        const statusScore = getStatusMoveScore(move.name);

        return {
            kind: "move",
            label: move.name,
            score: statusScore.score,
            reasonList: statusScore.reasonList,
        };
    }

    const effectiveness = getTypeEffectiveness(
        move.type,
        opponentPokemon.types,
    );
    const sameTypeAttackBonus = move.type
        ? ownPokemonMaster.types.includes(move.type)
        : false;

    const power = move.power ?? 0;

    let score = power * 0.45;

    if (effectiveness === 0) {
        score -= 80;
        reasonList.push("相手に無効化されます。");
    } else if (effectiveness >= 4) {
        score += 70;
        reasonList.push("相手に4倍弱点を突けます。");
    } else if (effectiveness >= 2) {
        score += 45;
        reasonList.push("相手の弱点を突けます。");
    } else if (effectiveness === 1) {
        score += 12;
        reasonList.push("相手に等倍で通ります。");
    } else {
        score -= 24;
        reasonList.push("相手に半減以下で受けられます。");
    }

    if (sameTypeAttackBonus) {
        score += 18;
        reasonList.push("タイプ一致で打てます。");
    }

    if (move.damageClass === "physical") {
        const ownAttack = getOwnApproxStat(
            ownPartyPokemon,
            ownPokemonMaster,
            "a",
        );
        const opponentDefense = getApproxStat(opponentPokemon, "b");

        if (ownAttack >= opponentDefense + 30) {
            score += 18;
            reasonList.push(
                "自分のAが相手のBより高めで、物理技が通りやすいです。",
            );
        } else if (ownAttack < opponentDefense) {
            score -= 10;
            reasonList.push(
                "相手のBが高めなので、物理技は少し通りにくいです。",
            );
        }
    }

    if (move.damageClass === "special") {
        const ownSpecialAttack = getOwnApproxStat(
            ownPartyPokemon,
            ownPokemonMaster,
            "c",
        );
        const opponentSpecialDefense = getApproxStat(opponentPokemon, "d");

        if (ownSpecialAttack >= opponentSpecialDefense + 30) {
            score += 18;
            reasonList.push(
                "自分のCが相手のDより高めで、特殊技が通りやすいです。",
            );
        } else if (ownSpecialAttack < opponentSpecialDefense) {
            score -= 10;
            reasonList.push(
                "相手のDが高めなので、特殊技は少し通りにくいです。",
            );
        }
    }

    const ownSpeed = getOwnApproxStat(ownPartyPokemon, ownPokemonMaster, "s");
    const opponentSpeed = getApproxStat(opponentPokemon, "s");

    if (ownSpeed > opponentSpeed) {
        score += 10;
        reasonList.push("相手より先に動ける想定です。");
    } else if (ownSpeed < opponentSpeed) {
        score -= 8;
        reasonList.push("相手に先に動かれる想定です。");
    }

    reasonList.unshift(
        `${getDamageClassLabel(move.damageClass)}技として評価しています。`,
    );

    return {
        kind: "move",
        label: move.name,
        score: Math.round(score),
        reasonList,
    };
};

const evaluateSwitch = ({
    ownPartyPokemon,
    ownPokemonMaster,
    opponentPokemon,
}: {
    ownPartyPokemon: PartyPokemon;
    ownPokemonMaster: Pokemon;
    opponentPokemon: Pokemon;
}): SuggestedBattleAction => {
    const ownSpeed = getOwnApproxStat(ownPartyPokemon, ownPokemonMaster, "s");
    const opponentSpeed = getApproxStat(opponentPokemon, "s");

    const ownBulk =
        getOwnApproxStat(ownPartyPokemon, ownPokemonMaster, "h") +
        getOwnApproxStat(ownPartyPokemon, ownPokemonMaster, "b") +
        getOwnApproxStat(ownPartyPokemon, ownPokemonMaster, "d");

    const opponentAttackPressure =
        opponentPokemon.base_stats.a + opponentPokemon.base_stats.c;

    let score = 35;
    const reasonList: string[] = [];

    if (opponentAttackPressure >= 240) {
        score += 12;
        reasonList.push("相手の攻撃性能が高めなので、交代も候補になります。");
    }

    if (ownSpeed < opponentSpeed) {
        score += 8;
        reasonList.push(
            "相手より遅い想定なので、無理に突っ張らない選択肢です。",
        );
    }

    if (ownBulk >= 430) {
        score -= 8;
        reasonList.push("自分側の耐久は高めなので、居座りも検討できます。");
    }

    if (reasonList.length === 0) {
        reasonList.push("対面が不安な場合の安全寄りの選択肢です。");
    }

    return {
        kind: "switch",
        label: "交代",
        score: Math.round(score),
        reasonList,
    };
};

const getPartyPokemonDisplayName = (
    partyPokemon: PartyPokemon,
    pokemonMaster: Pokemon,
): string => {
    return (
        partyPokemon.nickname || pokemonMaster.name || partyPokemon.pokemon_key
    );
};

const evaluateSwitchTarget = ({
    switchTarget,
    switchTargetMaster,
    opponentPokemon,
}: {
    switchTarget: PartyPokemon;
    switchTargetMaster: Pokemon;
    opponentPokemon: Pokemon;
}): SuggestedBattleAction => {
    const reasonList: string[] = [];

    const defensiveMultiplier = getDefensiveMultiplier(
        switchTargetMaster.types,
        opponentPokemon.types,
    );

    const switchTargetBulk =
        getOwnApproxStat(switchTarget, switchTargetMaster, "h") +
        getOwnApproxStat(switchTarget, switchTargetMaster, "b") +
        getOwnApproxStat(switchTarget, switchTargetMaster, "d");

    const switchTargetSpeed = getOwnApproxStat(
        switchTarget,
        switchTargetMaster,
        "s",
    );

    const opponentSpeed = getApproxStat(opponentPokemon, "s");

    let score = 34;

    if (defensiveMultiplier === 0) {
        score += 45;
        reasonList.push("相手のタイプ一致技を無効にできる可能性があります。");
    } else if (defensiveMultiplier <= 0.25) {
        score += 36;
        reasonList.push("相手のタイプ一致技をかなり受けやすいです。");
    } else if (defensiveMultiplier <= 0.5) {
        score += 26;
        reasonList.push("相手のタイプ一致技を半減で受けやすいです。");
    } else if (defensiveMultiplier === 1) {
        score += 8;
        reasonList.push("相手のタイプ一致技を等倍で受ける想定です。");
    } else if (defensiveMultiplier >= 4) {
        score -= 50;
        reasonList.push(
            "相手のタイプ一致技で4倍弱点を突かれる可能性があります。",
        );
    } else if (defensiveMultiplier >= 2) {
        score -= 28;
        reasonList.push("相手のタイプ一致技で弱点を突かれる可能性があります。");
    }

    if (switchTargetBulk >= 430) {
        score += 16;
        reasonList.push("耐久が高めなので、受け出し候補になります。");
    } else if (switchTargetBulk < 330) {
        score -= 10;
        reasonList.push("耐久は低めなので、受け出しは少し不安です。");
    }

    if (switchTargetSpeed > opponentSpeed) {
        score += 8;
        reasonList.push("交代後に相手より先に動ける可能性があります。");
    }

    if (reasonList.length === 0) {
        reasonList.push("現在の対面を避けるための交代候補です。");
    }

    return {
        kind: "switch",
        label: `${getPartyPokemonDisplayName(
            switchTarget,
            switchTargetMaster,
        )}へ交代`,
        targetPartyPokemonId: switchTarget.id,
        score: Math.round(score),
        reasonList,
    };
};

export const suggestNextBattleActions = ({
    ownPartyPokemon,
    ownPokemonMaster,
    opponentPokemon,
    partyPokemonList,
    pokemonMasterList,
    selectedPartyPokemonIds,
}: SuggestNextBattleActionsInput): SuggestedBattleAction[] => {
    const moveSuggestions = getMoveCandidates(ownPartyPokemon).map((move) =>
        evaluateMove({
            move,
            ownPartyPokemon,
            ownPokemonMaster,
            opponentPokemon,
        }),
    );

    const genericSwitchSuggestion = evaluateSwitch({
        ownPartyPokemon,
        ownPokemonMaster,
        opponentPokemon,
    });

    const selectedPartyPokemonIdSet = new Set(selectedPartyPokemonIds);

    const switchTargetSuggestions = partyPokemonList
        .filter((partyPokemon) =>
            selectedPartyPokemonIdSet.has(partyPokemon.id),
        )
        .filter((partyPokemon) => partyPokemon.id !== ownPartyPokemon.id)
        .map((partyPokemon) => {
            const pokemonMaster =
                pokemonMasterList.find(
                    (pokemon) =>
                        pokemon.key === partyPokemon.pokemon_key &&
                        pokemon.form_key === partyPokemon.form_key,
                ) ??
                pokemonMasterList.find(
                    (pokemon) =>
                        pokemon.key === partyPokemon.pokemon_key &&
                        pokemon.form_key === "default",
                );

            if (!pokemonMaster) {
                return null;
            }

            return evaluateSwitchTarget({
                switchTarget: partyPokemon,
                switchTargetMaster: pokemonMaster,
                opponentPokemon,
            });
        })
        .filter(
            (suggestion): suggestion is SuggestedBattleAction =>
                suggestion !== null,
        );

    const battleActionSuggestions = [
        ...moveSuggestions,
        ...switchTargetSuggestions,
    ];

    if (switchTargetSuggestions.length === 0) {
        battleActionSuggestions.push(genericSwitchSuggestion);
    }

    return battleActionSuggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);
};
