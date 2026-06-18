"use client";

import { AppHeader } from "@/components/AppHeader";
import { isMegaForm } from "@/features/battlePreview/utils/megaEvolution";
import {
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { createPartyPokemon } from "@/features/partyPokemon/api/partyPokemonApi";
import { PokemonBuildEditor } from "@/features/partyPokemon/components/PokemonBuildEditor";
import { PokemonSearchSelector } from "@/features/partyPokemon/components/PokemonSearchSelector";
import { validateEffortValues } from "@/features/partyPokemon/utils/validateEffortValues";
import { isPokemonAvailableForRule } from "@/features/pokemonRules/isPokemonAvailableForRule";
import { PartyRuleBadge } from "@/features/pokemonRules/PartyRuleBadge";
import {
    getEffortValueLimits,
    getPartyRuleConfig,
} from "@/features/pokemonRules/partyRuleConfig";
import type { NatureMaster } from "@/types/battleMaster";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toggleRoleTagId } from "@/features/partyPokemon/utils/toggleRoleTagId";

export default function CreatePartyPokemonPage() {
    const router = useRouter();
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const ruleConfig = getPartyRuleConfig(party?.rule ?? "main_series");
    const effortValueLimits = getEffortValueLimits(
        party?.rule ?? "main_series",
    );
    const [roleTags, setRoleTags] = useState<RoleTag[]>([]);

    const [pokemonKey, setPokemonKey] = useState("");
    const [formKey, setFormKey] = useState("default");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
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
    const [selectedRoleTagIds, setSelectedRoleTagIds] = useState<number[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [partyData, pokemonData, roleTagData] = await Promise.all(
                    [fetchParty(partyId), fetchPokemonList(), fetchRoleTags()],
                );

                setParty(partyData);
                setPokemonList(pokemonData);
                setRoleTags(roleTagData);
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

    if (isInvalidPartyId) {
        return (
            <main className="mx-auto max-w-7xl p-6">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    パーティIDが正しくありません。
                </p>
            </main>
        );
    }

    const handleSelectPokemon = (pokemon: Pokemon) => {
        setPokemonKey(pokemon.key);
        setFormKey(pokemon.form_key);

        setAbility("");
        setAbilityId(null);
    };

    const handleToggleRoleTag = (roleTagId: number) => {
        setSelectedRoleTagIds((currentIds) =>
            toggleRoleTagId(currentIds, roleTagId),
        );
    };

    const selectedPokemonMaster = pokemonList.find(
        (pokemon) => pokemon.key === pokemonKey && pokemon.form_key === formKey,
    );

    const currentPokemonList = party?.current_version?.pokemon ?? [];

    const isAlreadyRegisteredPokemon = (pokemon: Pokemon) => {
        return currentPokemonList.some(
            (partyPokemon) => partyPokemon.pokemon_key === pokemon.key,
        );
    };

    const toNumber = (value: string) => {
        return Number(value || 0);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!party?.current_version) {
            setErrorMessage("現在のバージョンが見つかりません。");
            return;
        }

        if (!pokemonKey || !formKey) {
            setErrorMessage("ポケモンを選択してください。");
            return;
        }

        if (currentPokemonList.length >= ruleConfig.partyPokemonLimit) {
            setErrorMessage(
                `このパーティには${ruleConfig.partyPokemonLimit}匹まで登録できます。`,
            );
            return;
        }

        // if (item.trim() !== "" && itemId === null) {
        //     setErrorMessage("持ち物は検索候補から選択してください。");
        //     return;
        // }

        if (ability.trim() !== "" && abilityId === null) {
            setErrorMessage("特性は検索候補から選択してください。");
            return;
        }

        if (nature.trim() !== "" && natureId === null) {
            setErrorMessage("性格は検索候補から選択してください。");
            return;
        }

        const moveEntries = [
            { name: move1, id: move1Id },
            { name: move2, id: move2Id },
            { name: move3, id: move3Id },
            { name: move4, id: move4Id },
        ];

        const hasUnselectedMove = moveEntries.some(
            (move) => move.name.trim() !== "" && move.id === null,
        );

        if (hasUnselectedMove) {
            setErrorMessage("技は検索候補から選択してください。");
            return;
        }

        const isDuplicatedPokemon = currentPokemonList.some(
            (partyPokemon) => partyPokemon.pokemon_key === pokemonKey,
        );

        if (isDuplicatedPokemon) {
            setErrorMessage(
                "同じ種類のポケモンは、フォーム違いを含めて同じパーティに登録できません。",
            );
            return;
        }

        const normalizedItem = item.trim();

        const hasDuplicatedItem =
            normalizedItem !== "" &&
            currentPokemonList.some(
                (partyPokemon) => partyPokemon.item?.trim() === normalizedItem,
            );

        if (hasDuplicatedItem) {
            setErrorMessage("同じ持ち物は同じパーティに登録できません。");
            return;
        }

        const moves = [move1, move2, move3, move4]
            .map((move) => move.trim())
            .filter((move) => move !== "");

        const hasDuplicatedMove = new Set(moves).size !== moves.length;

        if (hasDuplicatedMove) {
            setErrorMessage(
                "同じポケモンに同じ技を複数登録することはできません。",
            );
            return;
        }

        const effortValueLimits = getEffortValueLimits(party.rule);

        const effortValues = [
            toNumber(evH),
            toNumber(evA),
            toNumber(evB),
            toNumber(evC),
            toNumber(evD),
            toNumber(evS),
        ];

        const effortValueValidation = validateEffortValues(
            effortValues,
            effortValueLimits,
        );

        if (!effortValueValidation.isValid) {
            setErrorMessage(
                `${effortValueLimits.label}では、努力値は1項目${effortValueLimits.singleLimit}まで、合計${effortValueLimits.totalLimit}までです。`,
            );
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await createPartyPokemon(party.current_version.id, {
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
            });

            router.push(`/parties/${party.id}`);
        } catch (error) {
            console.error(error);
            setErrorMessage("ポケモン登録に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-7xl p-6">
                    <p>読み込み中...</p>
                </main>
            </>
        );
    }

    if (!party) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-7xl p-6">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        パーティが見つかりません。
                    </p>
                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-7xl p-6">
                <Link
                    href={`/parties/${party.id}`}
                    className="text-sm text-blue-600"
                >
                    ← パーティ詳細へ戻る
                </Link>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <h1 className="mt-4 text-2xl font-bold">ポケモン追加</h1>

                    <PartyRuleBadge rule={party.rule} />
                </div>
                <p className="mt-1 text-sm text-gray-600">
                    {party.name} に登録するポケモンを追加します。
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                    <section className="rounded border bg-white p-5">
                        <h2 className="text-lg font-bold">ポケモン選択</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            名前・かな・タイプから登録するポケモンを探せます。
                        </p>

                        <div className="mt-4">
                            <PokemonSearchSelector
                                pokemonList={pokemonList}
                                searchKeyword={searchKeyword}
                                onChangeSearchKeyword={setSearchKeyword}
                                selectedTypes={selectedTypes}
                                onChangeSelectedTypes={setSelectedTypes}
                                filterPokemon={(pokemon) =>
                                    !isMegaForm(pokemon) &&
                                    isPokemonAvailableForRule(
                                        pokemon,
                                        party.rule,
                                    )
                                }
                                isPokemonSelected={(pokemon) =>
                                    pokemon.key === pokemonKey &&
                                    pokemon.form_key === formKey
                                }
                                isPokemonDisabled={isAlreadyRegisteredPokemon}
                                getPokemonStatusLabel={(pokemon) => {
                                    if (isAlreadyRegisteredPokemon(pokemon)) {
                                        return "登録済み";
                                    }

                                    if (
                                        pokemon.key === pokemonKey &&
                                        pokemon.form_key === formKey
                                    ) {
                                        return "選択中";
                                    }

                                    return null;
                                }}
                                onSelectPokemon={(pokemon) => {
                                    if (isAlreadyRegisteredPokemon(pokemon)) {
                                        return;
                                    }

                                    handleSelectPokemon(pokemon);
                                }}
                            />
                        </div>

                        {pokemonKey ? (
                            <div className="mt-5 rounded border border-black bg-gray-50 p-4">
                                <p className="text-xs font-semibold text-gray-500">
                                    選択中のポケモン
                                </p>

                                <div className="mt-2 flex items-center gap-3">
                                    {selectedPokemonMaster?.image_url && (
                                        <img
                                            src={
                                                selectedPokemonMaster.image_url
                                            }
                                            alt={selectedPokemonMaster.name}
                                            className="h-12 w-12 object-contain"
                                        />
                                    )}

                                    <div>
                                        <p className="font-bold">
                                            {selectedPokemonMaster?.name ||
                                                pokemonKey}
                                        </p>

                                        {selectedPokemonMaster && (
                                            <p className="mt-1 text-xs text-gray-600">
                                                {selectedPokemonMaster.types.join(
                                                    " / ",
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <p className="mt-3 rounded bg-white px-3 py-2 text-xs text-gray-700">
                                    このポケモンの特性、持ち物、性格、努力値、技、役割タグを下で入力してください。
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 rounded bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    まず登録するポケモンを選択してください。
                                </p>
                            </div>
                        )}
                    </section>

                    <section className="rounded border bg-white p-5">
                        <h2 className="text-lg font-bold">型・技情報</h2>

                        <div className="mt-4">
                            <PokemonBuildEditor
                                pokemonKey={pokemonKey}
                                formKey={formKey}
                                nickname={nickname}
                                onChangeNickname={setNickname}
                                abilityId={abilityId}
                                onSelectAbility={(selectedAbility) => {
                                    setAbility(selectedAbility.name);

                                    setAbilityId(selectedAbility.id);
                                }}
                                item={item}
                                onChangeItemText={(value) => {
                                    setItem(value);
                                    setItemId(null);
                                }}
                                onSelectItem={(option) => {
                                    setItem(option.name);
                                    setItemId(option.id);
                                }}
                                nature={nature}
                                natureId={natureId}
                                natureMaster={selectedNatureMaster}
                                onChangeNatureText={(value) => {
                                    setNature(value);
                                    setNatureId(null);
                                    setSelectedNatureMaster(null);
                                }}
                                onSelectNature={(option) => {
                                    setNature(option.name);
                                    setNatureId(option.id);
                                    setSelectedNatureMaster(option);
                                }}
                                effortValues={{
                                    h: evH,
                                    a: evA,
                                    b: evB,
                                    c: evC,
                                    d: evD,
                                    s: evS,
                                }}
                                effortValueLimits={effortValueLimits}
                                onChangeEffortValue={(statKey, value) => {
                                    const setterMap = {
                                        h: setEvH,
                                        a: setEvA,
                                        b: setEvB,
                                        c: setEvC,
                                        d: setEvD,
                                        s: setEvS,
                                    };

                                    setterMap[statKey](value);
                                }}
                                moves={[
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
                                ]}
                                onChangeMove={(moveIndex, move) => {
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
                                }}
                                memo={memo}
                                onChangeMemo={setMemo}
                                roleTags={roleTags}
                                selectedRoleTagIds={selectedRoleTagIds}
                                onToggleRoleTag={handleToggleRoleTag}
                            />
                        </div>
                    </section>

                    {errorMessage && (
                        <p className="mt-6 rounded bg-red-100 p-3 text-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !pokemonKey}
                        className="rounded bg-black px-5 py-3 text-white disabled:opacity-50"
                    >
                        {isSubmitting ? "登録中..." : "ポケモンを登録する"}
                    </button>
                </form>
            </main>
        </>
    );
}
