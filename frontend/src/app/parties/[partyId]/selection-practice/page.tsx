"use client";

import { fetchPokemonList } from "@/features/master/api/masterApi";
import { PokemonSearchSelector } from "@/features/partyPokemon/components/PokemonSearchSelector";
import { fetchParty } from "@/features/parties/api/partyApi";
import { isPokemonAvailableForRule } from "@/features/pokemonRules/isPokemonAvailableForRule";
import { suggestMatchupSelections } from "@/features/selections/utils/suggestMatchupSelections";
import type { BattleLog, Party, PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BattlePokemonCard } from "@/features/battlePreview/components/BattlePokemonCard";
import { OpponentPartyColumn } from "@/features/battlePreview/components/OpponentPartyColumn";
import { AbilityTooltip } from "@/features/battlePreview/components/AbilityTooltip";
import { ItemTooltip } from "@/features/battlePreview/components/ItemTooltip";
import { MegaFormToggle } from "@/features/battlePreview/components/MegaFormToggle";
import {
    findDefaultForm,
    isMegaForm,
} from "@/features/battlePreview/utils/megaEvolution";
import { fetchPokemonAbilityWarnings } from "@/features/master/api/pokemonAbilityWarningApi";
import type { PokemonAbilityWarning } from "@/types/pokemonAbilityWarning";
import { getPokemonTypeClassName } from "@/utils/pokemonTypeStyle";

type OpponentGenerationMode = "random" | "battle_log" | "template";
type PokemonAbilityCandidate = PokemonAbilityWarning["abilities"][number];
type SelectionMatchResult = {
    memberMatchCount: number;
    isLeadMatch: boolean;
    isBackPairMatch: boolean;
    isExactRoleMatch: boolean;
};

const getPokemonIdentifier = (pokemon: Pokemon): string => {
    return `${pokemon.key}:${pokemon.form_key}`;
};

const getPartyPokemonDisplayName = (
    partyPokemon: PartyPokemon,
    pokemonMaster?: Pokemon,
): string => {
    return (
        partyPokemon.nickname || pokemonMaster?.name || partyPokemon.pokemon_key
    );
};

const getSelectionMatchResult = (
    selectedPartyPokemonIds: number[],
    suggestedPartyPokemonIds: number[],
): SelectionMatchResult => {
    const selectedIdSet = new Set(selectedPartyPokemonIds);

    const memberMatchCount = suggestedPartyPokemonIds.filter((id) =>
        selectedIdSet.has(id),
    ).length;

    const isLeadMatch =
        selectedPartyPokemonIds[0] === suggestedPartyPokemonIds[0];

    const selectedBackIds = selectedPartyPokemonIds.slice(1);
    const suggestedBackIds = suggestedPartyPokemonIds.slice(1);

    const isBackPairMatch =
        selectedBackIds.length === 2 &&
        suggestedBackIds.length === 2 &&
        selectedBackIds.every((id) => suggestedBackIds.includes(id));

    const isExactRoleMatch =
        selectedPartyPokemonIds.length === 3 &&
        suggestedPartyPokemonIds.length === 3 &&
        selectedPartyPokemonIds.every(
            (id, index) => id === suggestedPartyPokemonIds[index],
        );

    return {
        memberMatchCount,
        isLeadMatch,
        isBackPairMatch,
        isExactRoleMatch,
    };
};

const getSelectionMatchMessage = ({
    memberMatchCount,
    isLeadMatch,
    isBackPairMatch,
    isExactRoleMatch,
}: SelectionMatchResult): string => {
    if (isExactRoleMatch) {
        return "おすすめ選出と、初手・引き先・勝ち筋まで完全一致しています。";
    }

    if (memberMatchCount === 3 && isLeadMatch && isBackPairMatch) {
        return "おすすめと同じ3匹で、初手も一致しています。後ろ2匹の役割順だけが異なります。";
    }

    if (memberMatchCount === 3 && !isLeadMatch) {
        return "選出する3匹はおすすめと同じですが、初手が異なります。初手対面の狙いを確認してみましょう。";
    }

    if (memberMatchCount === 2 && isLeadMatch) {
        return "初手はおすすめと一致し、選出メンバーも2匹一致しています。方向性はかなり近いです。";
    }

    if (memberMatchCount === 2) {
        return "おすすめ選出と2匹一致していますが、初手は異なります。別の展開を狙った選出です。";
    }

    if (memberMatchCount === 1 && isLeadMatch) {
        return "初手だけはおすすめと一致していますが、後ろの組み合わせは大きく異なります。";
    }

    if (memberMatchCount === 1) {
        return "おすすめ選出と1匹一致しています。別の勝ち筋を見ている可能性があります。";
    }

    return "おすすめ選出とは異なる3匹です。狙いや対応したい相手をメモしておくと振り返りに役立ちます。";
};

const getSelectedScoreMessage = (score: number | null): string => {
    if (score === null) {
        return "採点できませんでした。相手ポケモンや自分の選出が不足していないか確認してください。";
    }

    if (score >= 80) {
        return "かなり評価が高い選出です。";
    }

    if (score >= 60) {
        return "悪くない選出です。相手の重い枠への対応を確認してみましょう。";
    }

    return "やや不安がある選出です。役割や受け先が足りているか確認してみましょう。";
};

const generationModeLabels: Record<OpponentGenerationMode, string> = {
    random: "ランダム",
    battle_log: "ログから",
    template: "テンプレートから",
};

const shuffleArray = <T,>(items: T[]): T[] => {
    const shuffledItems = [...items];

    for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));

        [shuffledItems[index], shuffledItems[randomIndex]] = [
            shuffledItems[randomIndex],
            shuffledItems[index],
        ];
    }

    return shuffledItems;
};

const getOpponentPokemonIdentifiersFromBattleLog = (
    battleLog: BattleLog,
): {
    pokemonKey: string;
    formKey: string;
}[] => {
    return [
        {
            pokemonKey: battleLog.opponent_pokemon_1,
            formKey: battleLog.opponent_form_1,
        },
        {
            pokemonKey: battleLog.opponent_pokemon_2,
            formKey: battleLog.opponent_form_2,
        },
        {
            pokemonKey: battleLog.opponent_pokemon_3,
            formKey: battleLog.opponent_form_3,
        },
        {
            pokemonKey: battleLog.opponent_pokemon_4,
            formKey: battleLog.opponent_form_4,
        },
        {
            pokemonKey: battleLog.opponent_pokemon_5,
            formKey: battleLog.opponent_form_5,
        },
        {
            pokemonKey: battleLog.opponent_pokemon_6,
            formKey: battleLog.opponent_form_6,
        },
    ]
        .filter(
            (
                item,
            ): item is {
                pokemonKey: string;
                formKey: string | null;
            } => Boolean(item.pokemonKey),
        )
        .map((item) => ({
            pokemonKey: item.pokemonKey,
            formKey: item.formKey || "default",
        }));
};

const restoreOpponentPokemonFromBattleLog = ({
    battleLog,
    pokemonList,
}: {
    battleLog: BattleLog;
    pokemonList: Pokemon[];
}): Pokemon[] => {
    const identifiers = getOpponentPokemonIdentifiersFromBattleLog(battleLog);

    const restoredPokemonList = identifiers
        .map(({ pokemonKey, formKey }) => {
            return (
                pokemonList.find(
                    (pokemon) =>
                        pokemon.key === pokemonKey &&
                        pokemon.form_key === formKey,
                ) ??
                pokemonList.find(
                    (pokemon) =>
                        pokemon.key === pokemonKey &&
                        pokemon.form_key === "default",
                ) ??
                null
            );
        })
        .filter((pokemon): pokemon is Pokemon => pokemon !== null);

    const pokemonByKey = new Map<string, Pokemon>();

    restoredPokemonList.forEach((pokemon) => {
        if (!pokemonByKey.has(pokemon.key)) {
            pokemonByKey.set(pokemon.key, pokemon);
        }
    });

    return [...pokemonByKey.values()];
};

const getAvailableBattleLogs = ({
    battleLogs,
    pokemonList,
}: {
    battleLogs: BattleLog[];
    pokemonList: Pokemon[];
}): {
    battleLog: BattleLog;
    opponentPokemonList: Pokemon[];
}[] => {
    return battleLogs
        .map((battleLog) => ({
            battleLog,
            opponentPokemonList: restoreOpponentPokemonFromBattleLog({
                battleLog,
                pokemonList,
            }),
        }))
        .filter(({ opponentPokemonList }) => opponentPokemonList.length > 0);
};

const getRandomOpponentCandidates = ({
    pokemonList,
    partyRule,
}: {
    pokemonList: Pokemon[];
    partyRule: Party["rule"];
}): Pokemon[] => {
    const availablePokemonList = pokemonList.filter((pokemon) =>
        isPokemonAvailableForRule(pokemon, partyRule),
    );

    const pokemonByKey = new Map<string, Pokemon>();

    availablePokemonList.forEach((pokemon) => {
        if (isMegaForm(pokemon)) {
            return;
        }

        const currentPokemon = pokemonByKey.get(pokemon.key);

        if (!currentPokemon) {
            pokemonByKey.set(pokemon.key, pokemon);
            return;
        }

        if (
            currentPokemon.form_key !== "default" &&
            pokemon.form_key === "default"
        ) {
            pokemonByKey.set(pokemon.key, pokemon);
        }
    });

    return [...pokemonByKey.values()];
};

export default function SelectionPracticePage() {
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [opponentPokemonList, setOpponentPokemonList] = useState<Pokemon[]>(
        [],
    );
    const [selectedPartyPokemonIds, setSelectedPartyPokemonIds] = useState<
        number[]
    >([]);

    const [pokemonAbilityWarnings, setPokemonAbilityWarnings] = useState<
        PokemonAbilityWarning[]
    >([]);

    const [ownPokemonFormOverrides, setOwnPokemonFormOverrides] = useState<
        Record<number, string>
    >({});

    const [ownPokemonAbilityOverrides, setOwnPokemonAbilityOverrides] =
        useState<Record<number, PokemonAbilityCandidate | null>>({});

    const [opponentGenerationMode, setOpponentGenerationMode] =
        useState<OpponentGenerationMode>("random");
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);

    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [practiceMemo, setPracticeMemo] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [partyData, pokemonData] = await Promise.all([
                    fetchParty(partyId),
                    fetchPokemonList(),
                ]);

                setParty(partyData);
                setPokemonList(pokemonData);
            } catch (error) {
                console.error(error);
                setErrorMessage("必要なデータの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (isInvalidPartyId) {
            return;
        }

        loadData();
    }, [partyId, isInvalidPartyId]);

    useEffect(() => {
        const loadPokemonAbilityWarnings = async () => {
            if (opponentPokemonList.length === 0) {
                setPokemonAbilityWarnings([]);
                return;
            }

            try {
                const pokemonKeys = opponentPokemonList.map(
                    (pokemon) => `${pokemon.key}:${pokemon.form_key}`,
                );

                const data = await fetchPokemonAbilityWarnings(pokemonKeys);

                setPokemonAbilityWarnings(data);
            } catch (error) {
                console.error(error);
                setPokemonAbilityWarnings([]);
            }
        };

        loadPokemonAbilityWarnings();
    }, [opponentPokemonList]);

    const currentPokemonList = party?.current_version?.pokemon ?? [];
    const savedSelectionTemplates =
        party?.current_version?.selection_templates ?? [];
    const battleLogs = party?.current_version?.battle_logs ?? [];
    const availableBattleLogs = getAvailableBattleLogs({
        battleLogs,
        pokemonList,
    });

    const effectiveCurrentPokemonList = currentPokemonList.map(
        (partyPokemon) => {
            const overriddenFormKey = ownPokemonFormOverrides[partyPokemon.id];

            const hasAbilityOverride = Object.prototype.hasOwnProperty.call(
                ownPokemonAbilityOverrides,
                partyPokemon.id,
            );

            const overriddenAbility =
                ownPokemonAbilityOverrides[partyPokemon.id];

            return {
                ...partyPokemon,

                form_key: overriddenFormKey ?? partyPokemon.form_key,

                ability: hasAbilityOverride
                    ? (overriddenAbility?.name ?? "")
                    : partyPokemon.ability,

                ability_id: hasAbilityOverride
                    ? (overriddenAbility?.id ?? null)
                    : partyPokemon.ability_id,

                ability_master: hasAbilityOverride
                    ? overriddenAbility
                    : partyPokemon.ability_master,
            };
        },
    );

    const findPokemonMaster = (pokemonKey: string, formKey: string) => {
        return pokemonList.find(
            (pokemon) =>
                pokemon.key === pokemonKey && pokemon.form_key === formKey,
        );
    };

    const resetOtherOpponentMegaForms = (
        currentList: Pokemon[],
        excludedPokemonKey?: string,
    ): Pokemon[] => {
        return currentList.map((pokemon) => {
            if (pokemon.key === excludedPokemonKey) {
                return pokemon;
            }

            if (!isMegaForm(pokemon)) {
                return pokemon;
            }

            return findDefaultForm(pokemonList, pokemon.key) ?? pokemon;
        });
    };

    const handleChangeOwnPokemonForm = async (
        partyPokemonId: number,
        nextPokemon: Pokemon,
    ) => {
        const originalPartyPokemon = currentPokemonList.find(
            (partyPokemon) => partyPokemon.id === partyPokemonId,
        );

        if (!originalPartyPokemon) {
            return;
        }

        const isNextMegaForm = isMegaForm(nextPokemon);

        setOwnPokemonFormOverrides((currentOverrides) => {
            const nextOverrides = {
                ...currentOverrides,
            };

            if (isNextMegaForm) {
                currentPokemonList.forEach((partyPokemon) => {
                    if (partyPokemon.id === partyPokemonId) {
                        return;
                    }

                    delete nextOverrides[partyPokemon.id];
                });
            }

            if (nextPokemon.form_key === originalPartyPokemon.form_key) {
                delete nextOverrides[partyPokemonId];

                return nextOverrides;
            }

            nextOverrides[partyPokemonId] = nextPokemon.form_key;

            return nextOverrides;
        });

        if (isNextMegaForm) {
            setOwnPokemonAbilityOverrides((currentOverrides) => {
                const nextOverrides = {
                    ...currentOverrides,
                };

                currentPokemonList.forEach((partyPokemon) => {
                    if (partyPokemon.id === partyPokemonId) {
                        return;
                    }

                    delete nextOverrides[partyPokemon.id];
                });

                return nextOverrides;
            });
        }

        if (nextPokemon.form_key === originalPartyPokemon.form_key) {
            setOwnPokemonAbilityOverrides((currentOverrides) => {
                const nextOverrides = {
                    ...currentOverrides,
                };

                delete nextOverrides[partyPokemonId];

                return nextOverrides;
            });

            return;
        }

        try {
            const data = await fetchPokemonAbilityWarnings([
                `${nextPokemon.key}:${nextPokemon.form_key}`,
            ]);

            const abilityCandidates = data[0]?.abilities ?? [];
            const temporaryAbility =
                abilityCandidates.length === 1 ? abilityCandidates[0] : null;

            setOwnPokemonAbilityOverrides((currentOverrides) => ({
                ...currentOverrides,
                [partyPokemonId]: temporaryAbility,
            }));
        } catch (error) {
            console.error(error);

            setOwnPokemonAbilityOverrides((currentOverrides) => ({
                ...currentOverrides,
                [partyPokemonId]: null,
            }));
        }

        resetAnswer();
    };

    const handleChangeOpponentPokemonForm = (
        currentPokemon: Pokemon,
        nextPokemon: Pokemon,
    ) => {
        setOpponentPokemonList((currentList) => {
            const baseList = isMegaForm(nextPokemon)
                ? resetOtherOpponentMegaForms(currentList, currentPokemon.key)
                : currentList;

            return baseList.map((pokemon) =>
                pokemon.key === currentPokemon.key ? nextPokemon : pokemon,
            );
        });

        resetAnswer();
    };

    const getPokemonAbilities = (pokemon: Pokemon) => {
        const pokemonAbilityData = pokemonAbilityWarnings.find(
            (item) =>
                item.pokemon_key === pokemon.key &&
                item.form_key === pokemon.form_key,
        );

        return pokemonAbilityData?.abilities ?? [];
    };

    const resetAnswer = () => {
        setIsAnswerVisible(false);
    };

    const handleAddOpponentPokemon = (pokemon: Pokemon) => {
        if (opponentPokemonList.length >= 6) {
            return;
        }

        const alreadySelected = opponentPokemonList.some(
            (selectedPokemon) => selectedPokemon.key === pokemon.key,
        );

        if (alreadySelected) {
            return;
        }

        setOpponentPokemonList((currentList) => {
            const nextList = isMegaForm(pokemon)
                ? resetOtherOpponentMegaForms(currentList)
                : currentList;

            return [...nextList, pokemon];
        });

        resetAnswer();
    };

    const handleRemoveOpponentPokemon = (pokemon: Pokemon) => {
        setOpponentPokemonList((currentList) =>
            currentList.filter(
                (selectedPokemon) =>
                    getPokemonIdentifier(selectedPokemon) !==
                    getPokemonIdentifier(pokemon),
            ),
        );
        resetAnswer();
    };

    const handleClearOpponentPokemon = () => {
        setOpponentPokemonList([]);
        setSelectedPartyPokemonIds([]);
        setPracticeMemo("");
        setSearchKeyword("");
        setSelectedTypes([]);
        setErrorMessage("");
        setIsAnswerVisible(false);
    };

    const handleTogglePartyPokemonSelection = (partyPokemonId: number) => {
        setSelectedPartyPokemonIds((currentIds) => {
            if (currentIds.includes(partyPokemonId)) {
                return currentIds.filter((id) => id !== partyPokemonId);
            }

            if (currentIds.length >= 3) {
                return currentIds;
            }

            return [...currentIds, partyPokemonId];
        });

        resetAnswer();
    };

    const allMatchupSelectionSuggestions = suggestMatchupSelections({
        partyPokemonList: effectiveCurrentPokemonList,
        pokemonMasterList: pokemonList,
        opponentPokemonList,
        savedSelectionTemplates,
        battleLogs,
        limit: null,
    });

    const matchupSelectionSuggestions = allMatchupSelectionSuggestions.slice(
        0,
        3,
    );

    const topSuggestion = matchupSelectionSuggestions[0] ?? null;

    const topSuggestedPartyPokemonIds = topSuggestion
        ? [
              topSuggestion.leadPokemon.id,
              topSuggestion.switchPokemon.id,
              topSuggestion.finisherPokemon.id,
          ]
        : [];

    const selectedSelectionSuggestion =
        selectedPartyPokemonIds.length === 3
            ? (allMatchupSelectionSuggestions.find((suggestion) => {
                  return (
                      suggestion.leadPokemon.id ===
                          selectedPartyPokemonIds[0] &&
                      suggestion.switchPokemon.id ===
                          selectedPartyPokemonIds[1] &&
                      suggestion.finisherPokemon.id ===
                          selectedPartyPokemonIds[2]
                  );
              }) ?? null)
            : null;

    const selectedSelectionScore =
        selectedSelectionSuggestion?.totalScore ?? null;

    const selectionMatchResult = getSelectionMatchResult(
        selectedPartyPokemonIds,
        topSuggestedPartyPokemonIds,
    );

    const selectedPartyPokemonList = selectedPartyPokemonIds
        .map((id) =>
            effectiveCurrentPokemonList.find(
                (partyPokemon) => partyPokemon.id === id,
            ),
        )
        .filter((partyPokemon) => partyPokemon !== undefined);

    const canShowAnswer =
        opponentPokemonList.length > 0 &&
        selectedPartyPokemonIds.length === 3 &&
        topSuggestion !== null;

    const handleUseTopSuggestion = () => {
        if (!topSuggestion) {
            return;
        }

        setSelectedPartyPokemonIds(topSuggestedPartyPokemonIds);
        setIsAnswerVisible(true);
    };

    const generateRandomOpponentParty = () => {
        if (!party) {
            return;
        }

        setErrorMessage("");

        const candidates = getRandomOpponentCandidates({
            pokemonList,
            partyRule: party.rule,
        });

        if (candidates.length < 6) {
            setErrorMessage(
                "ランダム生成に使えるポケモンが6匹未満のため、相手パーティを生成できませんでした。",
            );
            return;
        }

        const generatedOpponentParty = shuffleArray(candidates).slice(0, 6);

        setOpponentPokemonList(generatedOpponentParty);
        setSelectedPartyPokemonIds([]);
        setPracticeMemo("");
        setSearchKeyword("");
        setSelectedTypes([]);
        setIsAnswerVisible(false);
    };

    const generateOpponentPartyFromBattleLog = () => {
        setErrorMessage("");

        if (availableBattleLogs.length === 0) {
            setErrorMessage("相手パーティを生成できる対戦ログがありません。");
            return;
        }

        const randomIndex = Math.floor(
            Math.random() * availableBattleLogs.length,
        );

        const selectedLog = availableBattleLogs[randomIndex];

        setOpponentPokemonList(selectedLog.opponentPokemonList);
        setSelectedPartyPokemonIds([]);
        setPracticeMemo("");
        setSearchKeyword("");
        setSelectedTypes([]);
        setIsAnswerVisible(false);
    };

    const handleGenerateOpponentParty = () => {
        if (opponentGenerationMode === "random") {
            generateRandomOpponentParty();
            return;
        }

        if (opponentGenerationMode === "battle_log") {
            generateOpponentPartyFromBattleLog();
            return;
        }

        setErrorMessage(
            "テンプレートから生成は、テンプレート登録機能の実装後に使えるようになります。",
        );
    };

    if (isInvalidPartyId) {
        return (
            <main className="mx-auto max-w-7xl p-6">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    パーティIDが正しくありません。
                </p>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="mx-auto max-w-7xl p-6">
                <p>読み込み中...</p>
            </main>
        );
    }

    if (!party) {
        return (
            <main className="mx-auto max-w-7xl p-6">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    {errorMessage || "パーティが見つかりません。"}
                </p>
            </main>
        );
    }

    const renderMoveTooltip = (partyPokemon: PartyPokemon) => {
        const moves = [
            {
                name: partyPokemon.move_1,
                type: partyPokemon.move_1_type,
            },
            {
                name: partyPokemon.move_2,
                type: partyPokemon.move_2_type,
            },
            {
                name: partyPokemon.move_3,
                type: partyPokemon.move_3_type,
            },
            {
                name: partyPokemon.move_4,
                type: partyPokemon.move_4_type,
            },
        ].filter((move) => move.name);

        if (moves.length === 0) {
            return (
                <span className="rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-none text-gray-400">
                    技未登録
                </span>
            );
        }

        return (
            <div className="group relative">
                <span className="cursor-help rounded border px-1.5 py-0.5 text-[10px] font-semibold leading-none text-gray-600">
                    技
                </span>

                <div className="pointer-events-none absolute bottom-full right-0 z-30 mb-1 hidden w-52 rounded border bg-white p-2 text-[10px] shadow-lg group-hover:block">
                    <div className="space-y-1">
                        {moves.map((move) => (
                            <div
                                key={`${move.name}-${move.type}`}
                                className="flex items-center justify-between gap-2 rounded bg-gray-50 px-2 py-1"
                            >
                                <span className="min-w-0 truncate font-semibold">
                                    {move.name}
                                </span>

                                {move.type && (
                                    <span
                                        className={`shrink-0 rounded px-1.5 py-0.5 font-semibold ${getPokemonTypeClassName(
                                            move.type,
                                        )}`}
                                    >
                                        {move.type}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderPartyPokemonCard = (partyPokemon: PartyPokemon) => {
        const pokemonMaster = findPokemonMaster(
            partyPokemon.pokemon_key,
            partyPokemon.form_key,
        );

        if (!pokemonMaster) {
            return (
                <div
                    key={partyPokemon.id}
                    className="rounded border bg-red-50 p-3 text-sm text-red-700"
                >
                    マスターデータが見つかりません：{partyPokemon.pokemon_key}
                </div>
            );
        }

        const selectedIndex = selectedPartyPokemonIds.indexOf(partyPokemon.id);
        const selectionOrder = selectedIndex >= 0 ? selectedIndex + 1 : null;

        return (
            <BattlePokemonCard
                key={partyPokemon.id}
                pokemon={pokemonMaster}
                headerAction={
                    <MegaFormToggle
                        pokemon={pokemonMaster}
                        pokemonList={pokemonList}
                        onChange={(pokemon) =>
                            handleChangeOwnPokemonForm(partyPokemon.id, pokemon)
                        }
                    />
                }
                imageAction={
                    <button
                        type="button"
                        onClick={() =>
                            handleTogglePartyPokemonSelection(partyPokemon.id)
                        }
                        className={`flex h-4 w-full items-center justify-center whitespace-nowrap rounded border px-0.5 text-[10px] font-semibold leading-none ${
                            selectionOrder
                                ? "border-black bg-black text-white"
                                : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {selectionOrder ?? "選出外"}
                    </button>
                }
                footer={
                    <div className="flex w-full items-center gap-1">
                        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                            {partyPokemon.ability_master ? (
                                <AbilityTooltip
                                    name={partyPokemon.ability_master.name}
                                    description={
                                        partyPokemon.ability_master.description
                                    }
                                />
                            ) : (
                                <span className="text-[10px] leading-none text-gray-400">
                                    特性未登録
                                </span>
                            )}

                            {partyPokemon.item ? (
                                <ItemTooltip
                                    name={partyPokemon.item}
                                    description={
                                        partyPokemon.item_master?.description
                                    }
                                    effectRules={
                                        partyPokemon.item_master?.effect_rules
                                    }
                                />
                            ) : (
                                <span className="text-[10px] leading-none text-gray-400">
                                    持ち物未登録
                                </span>
                            )}
                        </div>

                        <div className="ml-auto shrink-0">
                            {renderMoveTooltip(partyPokemon)}
                        </div>
                    </div>
                }
            />
        );
    };

    const renderSuggestedPokemon = (
        label: string,
        partyPokemon: PartyPokemon,
    ) => {
        const pokemonMaster = findPokemonMaster(
            partyPokemon.pokemon_key,
            partyPokemon.form_key,
        );

        const isSelected = selectedPartyPokemonIds.includes(partyPokemon.id);

        return (
            <div
                className={`rounded border p-3 ${
                    isSelected ? "border-black bg-gray-50" : "bg-white"
                }`}
            >
                <p className="text-xs font-semibold text-gray-500">{label}</p>

                <div className="mt-2 flex items-center gap-2">
                    {pokemonMaster?.image_url ? (
                        <img
                            src={pokemonMaster.image_url}
                            alt={pokemonMaster.name}
                            className="h-10 w-10 object-contain"
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                            ?
                        </div>
                    )}

                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                            {getPartyPokemonDisplayName(
                                partyPokemon,
                                pokemonMaster,
                            )}
                        </p>

                        <p className="text-[11px] text-gray-500">
                            {isSelected
                                ? "自分の選出に含まれています"
                                : "未選択"}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="mx-auto max-w-450 p-6">
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(19rem,1fr)_minmax(0,1.35fr)_minmax(19rem,1fr)]">
                <section className="rounded border bg-white p-3 xl:sticky xl:top-4 xl:self-start">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-base font-bold">自分のパーティ</h2>

                        <p className="text-sm font-medium text-gray-600">
                            {selectedPartyPokemonIds.length} / 3
                        </p>
                    </div>

                    {effectiveCurrentPokemonList.length === 0 ? (
                        <p className="mt-3 rounded bg-gray-50 p-3 text-sm text-gray-600">
                            パーティにポケモンが登録されていません。
                        </p>
                    ) : (
                        <div className="mt-2 space-y-1.5">
                            {effectiveCurrentPokemonList.map(
                                renderPartyPokemonCard,
                            )}
                        </div>
                    )}
                </section>

                <div className="min-w-0 space-y-3 xl:max-h-[calc(100vh-1rem)] xl:overflow-y-auto xl:pr-1">
                    <section className="rounded border bg-white px-3 py-2">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <Link
                                href={`/parties/${party.id}`}
                                className="text-xs text-blue-600"
                            >
                                ← パーティ詳細へ戻る
                            </Link>

                            <Link
                                href={`/parties/${party.id}/battle-preview`}
                                className="text-xs text-blue-600"
                            >
                                対戦前選出へ戻る
                            </Link>

                            <h1 className="text-base font-bold">
                                選出練習モード
                            </h1>

                            <p className="text-xs text-gray-500">
                                相手6匹を見て、自分で3匹を選びます。答え合わせでおすすめ選出βと比較できます。
                            </p>
                        </div>
                    </section>

                    {errorMessage && (
                        <p className="rounded bg-red-100 p-3 text-sm text-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <section className="rounded border bg-white p-4">
                        <h2 className="text-lg font-bold">相手パーティ生成</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            生成方法を選んで、相手パーティを作る予定です。今回はUIだけ先に置いています。
                        </p>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                            {(
                                [
                                    "random",
                                    "battle_log",
                                    "template",
                                ] satisfies OpponentGenerationMode[]
                            ).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => {
                                        setOpponentGenerationMode(mode);
                                        setErrorMessage("");
                                    }}
                                    className={`rounded border px-3 py-2 text-sm font-semibold ${
                                        opponentGenerationMode === mode
                                            ? "border-black bg-gray-50"
                                            : "bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    <span>{generationModeLabels[mode]}</span>

                                    {mode === "battle_log" && (
                                        <span className="ml-1 text-xs text-gray-500">
                                            ({availableBattleLogs.length})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleGenerateOpponentParty}
                                className="rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
                            >
                                {generationModeLabels[opponentGenerationMode]}
                                で生成
                            </button>

                            <button
                                type="button"
                                onClick={handleClearOpponentPokemon}
                                className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                            >
                                相手を空にする
                            </button>
                        </div>

                        <p className="mt-3 text-xs text-gray-500">
                            選択中：
                            {generationModeLabels[opponentGenerationMode]}
                            {opponentGenerationMode === "random" &&
                                "。使用可能ポケモンから6匹をランダムで生成します。"}
                            {opponentGenerationMode === "battle_log" &&
                                "。保存済みの対戦ログから相手パーティをランダムで1件生成します。"}
                            {opponentGenerationMode === "template" &&
                                "。この生成方法はまだ準備中です。"}
                        </p>
                    </section>

                    <section className="rounded border bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold">
                                    相手ポケモンを探す
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    相手パーティへ追加するポケモンを選択してください。
                                </p>
                            </div>

                            <p className="text-sm font-medium text-gray-600">
                                {opponentPokemonList.length} / 6
                            </p>
                        </div>

                        <div className="mt-4">
                            <PokemonSearchSelector
                                layout="compact"
                                pokemonList={pokemonList}
                                searchKeyword={searchKeyword}
                                onChangeSearchKeyword={setSearchKeyword}
                                clearSearchKeywordOnSelect
                                selectedTypes={selectedTypes}
                                onChangeSelectedTypes={setSelectedTypes}
                                isPokemonSelected={(pokemon) =>
                                    opponentPokemonList.some(
                                        (selectedPokemon) =>
                                            selectedPokemon.key === pokemon.key,
                                    )
                                }
                                isPokemonDisabled={(pokemon) =>
                                    opponentPokemonList.length >= 6 ||
                                    opponentPokemonList.some(
                                        (selectedPokemon) =>
                                            selectedPokemon.key === pokemon.key,
                                    )
                                }
                                getPokemonStatusLabel={(pokemon) =>
                                    opponentPokemonList.some(
                                        (selectedPokemon) =>
                                            selectedPokemon.key === pokemon.key,
                                    )
                                        ? "選択済み"
                                        : null
                                }
                                onSelectPokemon={handleAddOpponentPokemon}
                                filterPokemon={(pokemon) =>
                                    isPokemonAvailableForRule(
                                        pokemon,
                                        party.rule,
                                    )
                                }
                            />
                        </div>
                    </section>

                    <section className="rounded border bg-white p-4">
                        <h2 className="text-lg font-bold">自分の選出評価</h2>

                        {opponentPokemonList.length === 0 ? (
                            <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                相手ポケモンを入力すると、選出評価を確認できます。
                            </p>
                        ) : selectedPartyPokemonIds.length < 3 ? (
                            <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                自分の選出3匹を選ぶと、点数と答え合わせができます。
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                <div className="rounded bg-gray-50 p-4">
                                    <div className="flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold">
                                                あなたの選出点
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                選んだ順番を「初手・引き先・勝ち筋」として採点しています。
                                            </p>
                                        </div>

                                        <p className="text-3xl font-bold">
                                            {selectedSelectionScore ?? "-"}
                                            <span className="ml-1 text-sm text-gray-500">
                                                点
                                            </span>
                                        </p>
                                    </div>

                                    <p className="mt-3 text-sm text-gray-600">
                                        {getSelectedScoreMessage(
                                            selectedSelectionScore,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded border p-4">
                                    <p className="text-sm font-bold">
                                        あなたの選出
                                    </p>

                                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                        {selectedPartyPokemonList.map(
                                            (partyPokemon, index) => {
                                                const pokemonMaster =
                                                    findPokemonMaster(
                                                        partyPokemon.pokemon_key,
                                                        partyPokemon.form_key,
                                                    );

                                                return (
                                                    <div
                                                        key={partyPokemon.id}
                                                        className="rounded bg-gray-50 p-3 text-center"
                                                    >
                                                        <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                                                            {index + 1}
                                                        </span>

                                                        {pokemonMaster?.image_url ? (
                                                            <img
                                                                src={
                                                                    pokemonMaster.image_url
                                                                }
                                                                alt={
                                                                    pokemonMaster.name
                                                                }
                                                                className="mx-auto mt-2 h-12 w-12 object-contain"
                                                            />
                                                        ) : (
                                                            <div className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded bg-white text-xs text-gray-400">
                                                                ?
                                                            </div>
                                                        )}

                                                        <p className="mt-2 truncate text-sm font-semibold">
                                                            {getPartyPokemonDisplayName(
                                                                partyPokemon,
                                                                pokemonMaster,
                                                            )}
                                                        </p>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsAnswerVisible(true)}
                                    disabled={!canShowAnswer}
                                    className="w-full rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:bg-gray-400"
                                >
                                    答え合わせする
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="rounded border bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-bold">答え合わせ</h2>

                            {isAnswerVisible && topSuggestion && (
                                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold">
                                    おすすめ {topSuggestion.totalScore}点
                                </span>
                            )}
                        </div>

                        {!isAnswerVisible ? (
                            <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                自分の選出を決めてから「答え合わせする」を押すと、おすすめ選出βを表示します。
                            </p>
                        ) : topSuggestion ? (
                            <div className="mt-4 space-y-4">
                                <div className="rounded bg-gray-50 p-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-bold">
                                            メンバー一致：
                                            {
                                                selectionMatchResult.memberMatchCount
                                            }{" "}
                                            / 3
                                        </p>

                                        <span
                                            className={`rounded px-2 py-0.5 text-xs font-semibold ${
                                                selectionMatchResult.isLeadMatch
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                                            初手：
                                            {selectionMatchResult.isLeadMatch
                                                ? "一致"
                                                : "不一致"}
                                        </span>

                                        {selectionMatchResult.memberMatchCount ===
                                            3 && (
                                            <span
                                                className={`rounded px-2 py-0.5 text-xs font-semibold ${
                                                    selectionMatchResult.isBackPairMatch
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                後ろ2匹：
                                                {selectionMatchResult.isBackPairMatch
                                                    ? "一致"
                                                    : "組み合わせ違い"}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-2 text-sm text-gray-600">
                                        {getSelectionMatchMessage(
                                            selectionMatchResult,
                                        )}
                                    </p>
                                </div>

                                <div className="grid gap-2 sm:grid-cols-3">
                                    {renderSuggestedPokemon(
                                        "初手",
                                        topSuggestion.leadPokemon,
                                    )}

                                    {renderSuggestedPokemon(
                                        "引き先",
                                        topSuggestion.switchPokemon,
                                    )}

                                    {renderSuggestedPokemon(
                                        "勝ち筋",
                                        topSuggestion.finisherPokemon,
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleUseTopSuggestion}
                                    className="w-full rounded border px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                    おすすめ選出を試す
                                </button>

                                {topSuggestion.reasons.length > 0 && (
                                    <div className="rounded border p-4">
                                        <p className="text-sm font-bold">
                                            おすすめ理由
                                        </p>

                                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                                            {topSuggestion.reasons.map(
                                                (reason) => (
                                                    <li key={reason}>
                                                        ・{reason}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                おすすめ選出を作れませんでした。
                            </p>
                        )}
                    </section>

                    <section className="rounded border bg-white p-4">
                        <h2 className="text-lg font-bold">練習メモ</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            なぜその3匹にしたか、重そうな相手、初手の狙いなどをメモします。まだ保存はしません。
                        </p>

                        <textarea
                            value={practiceMemo}
                            onChange={(event) =>
                                setPracticeMemo(event.target.value)
                            }
                            rows={5}
                            placeholder="例：初手ガブリアスでステロ。ブリジュラスが重いのでミミロップを選出。水ロトムは物理受けとして残す。"
                            className="mt-4 w-full rounded border px-3 py-2 text-sm"
                        />
                    </section>
                </div>

                <div className="xl:sticky xl:top-4">
                    <OpponentPartyColumn
                        opponentPokemonList={opponentPokemonList}
                        pokemonList={pokemonList}
                        getPokemonAbilities={getPokemonAbilities}
                        onRemove={handleRemoveOpponentPokemon}
                        onChangeForm={handleChangeOpponentPokemonForm}
                    />
                </div>
            </div>
        </main>
    );
}
