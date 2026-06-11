"use client";

import { AppHeader } from "@/components/AppHeader";
import { createBattleLog } from "@/features/battleLogs/api/battleLogApi";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import type { Party, PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const lossTagOptions = [
    "初手出し負け",
    "選出ミス",
    "受け先不足",
    "火力不足",
    "素早さ負け",
    "読み負け",
    "型を知らなかった",
    "重い相手を通した",
];

export default function CreateBattleLogPage() {
    const router = useRouter();
    const params = useParams<{ partyId: string }>();
    const searchParams = useSearchParams();
    const selectedQuery = searchParams.get("selected") ?? "";

    const initialSelectedPartyPokemonIds = selectedQuery
        .split(",")
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0)
        .slice(0, 3);

    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [selectedOpponentPokemonKeys, setSelectedOpponentPokemonKeys] =
        useState<string[]>([]);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);

    const [result, setResult] = useState<"win" | "lose">("win");
    const [selectedPokemonIds, setSelectedPokemonIds] = useState<number[]>(
        initialSelectedPartyPokemonIds,
    );
    const [heavyOpponent, setHeavyOpponent] = useState("");
    const [neededPokemonId, setNeededPokemonId] = useState("");
    const [lossTags, setLossTags] = useState<string[]>([]);
    const [reflection, setReflection] = useState("");
    const [nextNote, setNextNote] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const opponentParam = searchParams.get("opponents") ?? "";

    const opponentPokemonPairs = opponentParam
        .split(",")
        .filter(Boolean)
        .map((value) => {
            const [key, formKey] = value.split(":");

            return {
                key,
                form_key: formKey || "default",
            };
        });

    const createOpponentPokemonKey = (pokemonKey: string, formKey: string) => {
        return `${pokemonKey}:${formKey}`;
    };

    const handleChangeResult = (nextResult: "win" | "lose") => {
        setResult(nextResult);

        if (nextResult === "win") {
            setLossTags([]);
        }
    };

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

    const findPokemonMaster = (pokemonKey: string, formKey: string) => {
        return pokemonList.find(
            (pokemon) =>
                pokemon.key === pokemonKey && pokemon.form_key === formKey,
        );
    };

    const currentPokemonList = party?.current_version?.pokemon ?? [];

    const handleToggleSelectedPokemon = (partyPokemon: PartyPokemon) => {
        setSelectedPokemonIds((currentIds) => {
            if (currentIds.includes(partyPokemon.id)) {
                return currentIds.filter((id) => id !== partyPokemon.id);
            }

            if (currentIds.length >= 3) {
                return currentIds;
            }

            return [...currentIds, partyPokemon.id];
        });
    };

    const handleToggleSelectedOpponentPokemon = (
        pokemonKey: string,
        formKey: string,
    ) => {
        const opponentPokemonKey = createOpponentPokemonKey(
            pokemonKey,
            formKey,
        );

        setSelectedOpponentPokemonKeys((currentKeys) => {
            if (currentKeys.includes(opponentPokemonKey)) {
                return currentKeys.filter((key) => key !== opponentPokemonKey);
            }

            if (currentKeys.length >= 3) {
                return currentKeys;
            }

            return [...currentKeys, opponentPokemonKey];
        });
    };

    const handleToggleLossTag = (tag: string) => {
        setLossTags((currentTags) => {
            if (currentTags.includes(tag)) {
                return currentTags.filter((currentTag) => currentTag !== tag);
            }

            return [...currentTags, tag];
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!party?.current_version) {
            setErrorMessage("現在のバージョンが見つかりません。");
            return;
        }

        if (selectedPokemonIds.length !== 3) {
            setErrorMessage("実際に選出したポケモンを3匹選んでください。");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        const selectedOpponentPokemonPairs = selectedOpponentPokemonKeys.map(
            (value) => {
                const [key, formKey] = value.split(":");

                return {
                    key,
                    form_key: formKey || "default",
                };
            },
        );

        try {
            const payload = {
                result,

                opponent_pokemon_1: opponentPokemonPairs[0]?.key,
                opponent_form_1: opponentPokemonPairs[0]?.form_key,
                opponent_pokemon_2: opponentPokemonPairs[1]?.key,
                opponent_form_2: opponentPokemonPairs[1]?.form_key,
                opponent_pokemon_3: opponentPokemonPairs[2]?.key,
                opponent_form_3: opponentPokemonPairs[2]?.form_key,
                opponent_pokemon_4: opponentPokemonPairs[3]?.key,
                opponent_form_4: opponentPokemonPairs[3]?.form_key,
                opponent_pokemon_5: opponentPokemonPairs[4]?.key,
                opponent_form_5: opponentPokemonPairs[4]?.form_key,
                opponent_pokemon_6: opponentPokemonPairs[5]?.key,
                opponent_form_6: opponentPokemonPairs[5]?.form_key,

                selected_pokemon_1_id: selectedPokemonIds[0],
                selected_pokemon_2_id: selectedPokemonIds[1],
                selected_pokemon_3_id: selectedPokemonIds[2],

                selected_opponent_pokemon_1:
                    selectedOpponentPokemonPairs[0]?.key,
                selected_opponent_form_1:
                    selectedOpponentPokemonPairs[0]?.form_key,
                selected_opponent_pokemon_2:
                    selectedOpponentPokemonPairs[1]?.key,
                selected_opponent_form_2:
                    selectedOpponentPokemonPairs[1]?.form_key,
                selected_opponent_pokemon_3:
                    selectedOpponentPokemonPairs[2]?.key,
                selected_opponent_form_3:
                    selectedOpponentPokemonPairs[2]?.form_key,

                heavy_opponent_key: heavyOpponent
                    ? heavyOpponent.split(":")[0]
                    : undefined,
                heavy_opponent_form: heavyOpponent
                    ? heavyOpponent.split(":")[1]
                    : undefined,

                needed_pokemon_id: neededPokemonId
                    ? Number(neededPokemonId)
                    : undefined,

                loss_tags: result === "lose" ? lossTags : [],
                reflection,
                next_note: nextNote,
            };

            await createBattleLog(party.current_version.id, payload);

            router.push(`/parties/${party.id}`);
        } catch (error) {
            console.error(error);
            setErrorMessage("対戦ログの保存に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isInvalidPartyId) {
        return (
            <main className="mx-auto max-w-5xl p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    パーティIDが正しくありません。
                </p>
            </main>
        );
    }

    if (isLoading) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-5xl p-8">
                    <p>読み込み中...</p>
                </main>
            </>
        );
    }

    if (errorMessage && !party) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-5xl p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        {errorMessage}
                    </p>
                </main>
            </>
        );
    }

    if (!party) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-5xl p-8">
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

            <main className="mx-auto max-w-5xl p-8">
                <Link
                    href={`/parties/${party.id}/battle-preview`}
                    className="text-sm text-blue-600"
                >
                    ← 対戦前選出へ戻る
                </Link>

                <h1 className="mt-4 text-2xl font-bold">対戦ログ作成</h1>
                <p className="mt-1 text-sm text-gray-600">
                    対戦結果と反省を記録します。
                </p>

                {errorMessage && (
                    <p className="mt-6 rounded bg-red-100 p-3 text-red-700">
                        {errorMessage}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                    <section className="rounded border p-6">
                        <h2 className="text-lg font-bold">相手パーティ</h2>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {opponentPokemonPairs.map((opponent) => {
                                const pokemonMaster = findPokemonMaster(
                                    opponent.key,
                                    opponent.form_key,
                                );

                                const opponentPokemonKey =
                                    createOpponentPokemonKey(
                                        opponent.key,
                                        opponent.form_key,
                                    );

                                const isSelected =
                                    selectedOpponentPokemonKeys.includes(
                                        opponentPokemonKey,
                                    );

                                const selectedIndex =
                                    selectedOpponentPokemonKeys.indexOf(
                                        opponentPokemonKey,
                                    );

                                const selectionOrder =
                                    selectedIndex >= 0
                                        ? selectedIndex + 1
                                        : null;

                                return (
                                    <button
                                        key={`${opponent.key}-${opponent.form_key}`}
                                        type="button"
                                        onClick={() =>
                                            handleToggleSelectedOpponentPokemon(
                                                opponent.key,
                                                opponent.form_key,
                                            )
                                        }
                                        className={`rounded border p-3 text-left ${
                                            isSelected
                                                ? "border-black bg-gray-100"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        {pokemonMaster?.image_url && (
                                            <img
                                                src={pokemonMaster.image_url}
                                                alt={pokemonMaster.name}
                                                className="h-14 w-14 object-contain"
                                            />
                                        )}
                                        <p className="mt-2 font-bold">
                                            {pokemonMaster?.name ||
                                                opponent.key}
                                        </p>
                                        {pokemonMaster && (
                                            <p className="text-xs text-gray-600">
                                                {pokemonMaster.types.join(
                                                    " / ",
                                                )}
                                            </p>
                                        )}

                                        {selectionOrder && (
                                            <span className="mt-2 inline-block rounded bg-black px-2 py-0.5 text-xs font-semibold text-white">
                                                選出 {selectionOrder}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <p className="mt-3 text-sm text-gray-600">
                        相手の実選出：
                        {selectedOpponentPokemonKeys.length} / 3
                    </p>

                    <section className="rounded border p-6">
                        <h2 className="text-lg font-bold">勝敗</h2>

                        <div className="mt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => handleChangeResult("win")}
                                className={`rounded border px-4 py-2 ${
                                    result === "win"
                                        ? "bg-black text-white"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                勝ち
                            </button>

                            <button
                                type="button"
                                onClick={() => handleChangeResult("lose")}
                                className={`rounded border px-4 py-2 ${
                                    result === "lose"
                                        ? "bg-black text-white"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                負け
                            </button>
                        </div>
                    </section>

                    <section className="rounded border p-6">
                        <h2 className="text-lg font-bold">自分の選出3匹</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            実際に選出した3匹を選びます。
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {currentPokemonList.map((partyPokemon) => {
                                const pokemonMaster = findPokemonMaster(
                                    partyPokemon.pokemon_key,
                                    partyPokemon.form_key,
                                );

                                const isSelected = selectedPokemonIds.includes(
                                    partyPokemon.id,
                                );

                                const selectedIndex =
                                    selectedPokemonIds.indexOf(partyPokemon.id);

                                const selectionOrder =
                                    selectedIndex >= 0
                                        ? selectedIndex + 1
                                        : null;

                                return (
                                    <button
                                        key={partyPokemon.id}
                                        type="button"
                                        onClick={() =>
                                            handleToggleSelectedPokemon(
                                                partyPokemon,
                                            )
                                        }
                                        className={`rounded border p-3 text-left ${
                                            isSelected
                                                ? "border-black bg-gray-100"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-bold">
                                                {partyPokemon.nickname ||
                                                    pokemonMaster?.name ||
                                                    partyPokemon.pokemon_key}
                                            </p>

                                            {selectionOrder && (
                                                <span className="rounded bg-black px-2 py-0.5 text-xs font-semibold text-white">
                                                    {selectionOrder}
                                                </span>
                                            )}
                                        </div>

                                        {pokemonMaster && (
                                            <p className="text-xs text-gray-600">
                                                {pokemonMaster.types.join(
                                                    " / ",
                                                )}
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="mt-3 text-sm text-gray-600">
                            選択中：{selectedPokemonIds.length} / 3
                        </p>
                    </section>

                    <section className="rounded border p-6">
                        <h2 className="text-lg font-bold">振り返り</h2>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium">
                                    重かった相手
                                </label>
                                <select
                                    className="mt-1 w-full rounded border p-3"
                                    value={heavyOpponent}
                                    onChange={(event) =>
                                        setHeavyOpponent(event.target.value)
                                    }
                                >
                                    <option value="">選択なし</option>
                                    {opponentPokemonPairs.map((opponent) => {
                                        const pokemonMaster = findPokemonMaster(
                                            opponent.key,
                                            opponent.form_key,
                                        );

                                        return (
                                            <option
                                                key={`${opponent.key}-${opponent.form_key}`}
                                                value={`${opponent.key}:${opponent.form_key}`}
                                            >
                                                {pokemonMaster?.name ||
                                                    opponent.key}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    必要だった味方
                                </label>
                                <select
                                    className="mt-1 w-full rounded border p-3"
                                    value={neededPokemonId}
                                    onChange={(event) =>
                                        setNeededPokemonId(event.target.value)
                                    }
                                >
                                    <option value="">選択なし</option>
                                    {currentPokemonList.map((partyPokemon) => {
                                        const pokemonMaster = findPokemonMaster(
                                            partyPokemon.pokemon_key,
                                            partyPokemon.form_key,
                                        );

                                        return (
                                            <option
                                                key={partyPokemon.id}
                                                value={partyPokemon.id}
                                            >
                                                {partyPokemon.nickname ||
                                                    pokemonMaster?.name ||
                                                    partyPokemon.pokemon_key}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        {result === "lose" && (
                            <div className="mt-6">
                                <p className="text-sm font-medium">敗因タグ</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {lossTagOptions.map((tag) => {
                                        const isSelected =
                                            lossTags.includes(tag);

                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() =>
                                                    handleToggleLossTag(tag)
                                                }
                                                className={`rounded-full border px-3 py-1 text-sm ${
                                                    isSelected
                                                        ? "bg-black text-white"
                                                        : "hover:bg-gray-50"
                                                }`}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <label className="block text-sm font-medium">
                                反省メモ
                            </label>
                            <textarea
                                className="mt-1 w-full rounded border p-3"
                                rows={4}
                                value={reflection}
                                onChange={(event) =>
                                    setReflection(event.target.value)
                                }
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium">
                                次回メモ
                            </label>
                            <textarea
                                className="mt-1 w-full rounded border p-3"
                                rows={4}
                                value={nextNote}
                                onChange={(event) =>
                                    setNextNote(event.target.value)
                                }
                            />
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={
                            isSubmitting || selectedPokemonIds.length !== 3
                        }
                        className="rounded bg-black px-5 py-3 text-white disabled:opacity-50"
                    >
                        {isSubmitting ? "保存中..." : "対戦ログを保存する"}
                    </button>
                </form>
            </main>
        </>
    );
}
