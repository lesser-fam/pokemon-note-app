"use client";

import type { StoreBattleLogPayload } from "@/features/battleLogs/api/battleLogApi";
import type { Party, PartyPokemon } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import { getApiErrorMessage } from "@/utils/apiError";
import { FormEvent, useState } from "react";

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

export type OpponentPokemonPair = {
    key: string;
    form_key: string;
};

export type BattleLogFormInitialValues = {
    result: "win" | "lose";
    selectedPokemonIds: number[];
    selectedOpponentPokemonKeys: string[];
    heavyOpponent: string;
    neededPokemonId: string;
    lossTags: string[];
    reflection: string;
    nextNote: string;
};

type BattleLogFormProps = {
    party: Party;
    pokemonList: Pokemon[];
    opponentPokemonPairs: OpponentPokemonPair[];
    initialValues: BattleLogFormInitialValues;
    submitLabel: string;
    submittingLabel: string;
    onSubmit: (payload: StoreBattleLogPayload) => Promise<void>;
};

export function BattleLogForm({
    party,
    pokemonList,
    opponentPokemonPairs,
    initialValues,
    submitLabel,
    submittingLabel,
    onSubmit,
}: BattleLogFormProps) {
    const [result, setResult] = useState<"win" | "lose">(initialValues.result);

    const [selectedPokemonIds, setSelectedPokemonIds] = useState<number[]>(
        initialValues.selectedPokemonIds,
    );

    const [selectedOpponentPokemonKeys, setSelectedOpponentPokemonKeys] =
        useState<string[]>(initialValues.selectedOpponentPokemonKeys);

    const [heavyOpponent, setHeavyOpponent] = useState(
        initialValues.heavyOpponent,
    );

    const [neededPokemonId, setNeededPokemonId] = useState(
        initialValues.neededPokemonId,
    );

    const [lossTags, setLossTags] = useState<string[]>(initialValues.lossTags);

    const [reflection, setReflection] = useState(initialValues.reflection);

    const [nextNote, setNextNote] = useState(initialValues.nextNote);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const currentPokemonList = party.current_version?.pokemon ?? [];

    const createOpponentPokemonKey = (pokemonKey: string, formKey: string) => {
        return `${pokemonKey}:${formKey}`;
    };

    const findPokemonMaster = (pokemonKey: string, formKey: string) => {
        return pokemonList.find(
            (pokemon) =>
                pokemon.key === pokemonKey && pokemon.form_key === formKey,
        );
    };

    const handleChangeResult = (nextResult: "win" | "lose") => {
        setResult(nextResult);

        if (nextResult === "win") {
            setLossTags([]);
        }
    };

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

        if (!party.current_version) {
            setErrorMessage("現在のバージョンが見つかりません。");

            return;
        }

        if (selectedPokemonIds.length !== 3) {
            setErrorMessage("実際に選出したポケモンを3匹選んでください。");

            return;
        }

        if (selectedOpponentPokemonKeys.length < 1) {
            setErrorMessage("実際に選出された相手ポケモンを1匹以上選んでください。");

            return;
        }

        const selectedOpponentPokemonPairs = selectedOpponentPokemonKeys.map(
            (value) => {
                const [key, formKey] = value.split(":");

                return {
                    key,
                    form_key: formKey || "default",
                };
            },
        );

        const [heavyOpponentKey, heavyOpponentFormKey] =
            heavyOpponent.split(":");

        const payload: StoreBattleLogPayload = {
            result,

            opponent_pokemon_1: opponentPokemonPairs[0]?.key ?? null,
            opponent_form_1: opponentPokemonPairs[0]?.form_key ?? null,

            opponent_pokemon_2: opponentPokemonPairs[1]?.key ?? null,
            opponent_form_2: opponentPokemonPairs[1]?.form_key ?? null,

            opponent_pokemon_3: opponentPokemonPairs[2]?.key ?? null,
            opponent_form_3: opponentPokemonPairs[2]?.form_key ?? null,

            opponent_pokemon_4: opponentPokemonPairs[3]?.key ?? null,
            opponent_form_4: opponentPokemonPairs[3]?.form_key ?? null,

            opponent_pokemon_5: opponentPokemonPairs[4]?.key ?? null,
            opponent_form_5: opponentPokemonPairs[4]?.form_key ?? null,

            opponent_pokemon_6: opponentPokemonPairs[5]?.key ?? null,
            opponent_form_6: opponentPokemonPairs[5]?.form_key ?? null,

            selected_pokemon_1_id: selectedPokemonIds[0] ?? null,
            selected_pokemon_2_id: selectedPokemonIds[1] ?? null,
            selected_pokemon_3_id: selectedPokemonIds[2] ?? null,

            selected_opponent_pokemon_1:
                selectedOpponentPokemonPairs[0]?.key ?? null,
            selected_opponent_form_1:
                selectedOpponentPokemonPairs[0]?.form_key ?? null,

            selected_opponent_pokemon_2:
                selectedOpponentPokemonPairs[1]?.key ?? null,
            selected_opponent_form_2:
                selectedOpponentPokemonPairs[1]?.form_key ?? null,

            selected_opponent_pokemon_3:
                selectedOpponentPokemonPairs[2]?.key ?? null,
            selected_opponent_form_3:
                selectedOpponentPokemonPairs[2]?.form_key ?? null,

            heavy_opponent_key: heavyOpponent ? heavyOpponentKey : null,

            heavy_opponent_form: heavyOpponent
                ? heavyOpponentFormKey || "default"
                : null,

            needed_pokemon_id: neededPokemonId ? Number(neededPokemonId) : null,

            loss_tags: result === "lose" ? lossTags : [],

            reflection: reflection || null,

            next_note: nextNote || null,
        };

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await onSubmit(payload);
        } catch (error) {
            console.error(error);

            setErrorMessage(
                getApiErrorMessage(error, "対戦ログの保存に失敗しました。"),
            );

            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {errorMessage && (
                <p className="rounded bg-red-100 p-3 text-red-700">
                    {errorMessage}
                </p>
            )}

            <section className="rounded border p-5">
                <h2 className="text-lg font-bold">相手パーティ</h2>

                <p className="mt-1 text-sm text-gray-600">
                    実際に選出された相手を、見えた範囲で1匹以上、順番に3匹まで選べます。
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-3 md:grid-cols-6">
                    {opponentPokemonPairs.map((opponent) => {
                        const pokemonMaster = findPokemonMaster(
                            opponent.key,
                            opponent.form_key,
                        );

                        const opponentPokemonKey = createOpponentPokemonKey(
                            opponent.key,
                            opponent.form_key,
                        );

                        const selectedIndex =
                            selectedOpponentPokemonKeys.indexOf(
                                opponentPokemonKey,
                            );

                        const selectionOrder =
                            selectedIndex >= 0 ? selectedIndex + 1 : null;

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
                                title={pokemonMaster?.name || opponent.key}
                                className={`relative min-w-0 rounded border p-2 text-center ${
                                    selectionOrder
                                        ? "border-black bg-gray-100 ring-1 ring-black"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                {selectionOrder && (
                                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                                        {selectionOrder}
                                    </span>
                                )}

                                {pokemonMaster?.image_url ? (
                                    <img
                                        src={pokemonMaster.image_url}
                                        alt={pokemonMaster.name}
                                        className="mx-auto h-12 w-12 object-contain"
                                    />
                                ) : (
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                                        ?
                                    </div>
                                )}

                                <p className="mt-1 truncate text-xs font-bold">
                                    {pokemonMaster?.name || opponent.key}
                                </p>

                                {pokemonMaster && (
                                    <p className="mt-0.5 truncate text-[10px] text-gray-500">
                                        {pokemonMaster.types.join(" / ")}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>

                <p className="mt-3 text-sm text-gray-600">
                    相手の実選出：
                    {selectedOpponentPokemonKeys.length} / 3（1匹以上必須）
                </p>
            </section>

            <section className="rounded border p-5">
                <h2 className="text-lg font-bold">勝敗</h2>

                <div className="mt-3 flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleChangeResult("win")}
                        className={`w-24 rounded border px-4 py-2 text-center ${
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
                        className={`w-24 rounded border px-4 py-2 text-center ${
                            result === "lose"
                                ? "bg-black text-white"
                                : "hover:bg-gray-50"
                        }`}
                    >
                        負け
                    </button>
                </div>
            </section>

            <section className="rounded border p-5">
                <h2 className="text-lg font-bold">自分の選出3匹</h2>

                <p className="mt-1 text-sm text-gray-600">
                    実際に選出した順番で選びます。
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-3 md:grid-cols-6">
                    {currentPokemonList.map((partyPokemon) => {
                        const pokemonMaster = findPokemonMaster(
                            partyPokemon.pokemon_key,
                            partyPokemon.form_key,
                        );

                        const selectedIndex = selectedPokemonIds.indexOf(
                            partyPokemon.id,
                        );

                        const selectionOrder =
                            selectedIndex >= 0 ? selectedIndex + 1 : null;

                        return (
                            <button
                                key={partyPokemon.id}
                                type="button"
                                onClick={() =>
                                    handleToggleSelectedPokemon(partyPokemon)
                                }
                                title={
                                    partyPokemon.nickname ||
                                    pokemonMaster?.name ||
                                    partyPokemon.pokemon_key
                                }
                                className={`relative min-w-0 rounded border p-2 text-center ${
                                    selectionOrder
                                        ? "border-black bg-gray-100 ring-1 ring-black"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                {selectionOrder && (
                                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                                        {selectionOrder}
                                    </span>
                                )}

                                {pokemonMaster?.image_url ? (
                                    <img
                                        src={pokemonMaster.image_url}
                                        alt={pokemonMaster.name}
                                        className="mx-auto h-12 w-12 object-contain"
                                    />
                                ) : (
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                                        ?
                                    </div>
                                )}

                                <p className="mt-1 truncate text-xs font-bold">
                                    {partyPokemon.nickname ||
                                        pokemonMaster?.name ||
                                        partyPokemon.pokemon_key}
                                </p>

                                {pokemonMaster && (
                                    <p className="mt-0.5 truncate text-[10px] text-gray-500">
                                        {pokemonMaster.types.join(" / ")}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>

                <p className="mt-3 text-sm text-gray-600">
                    選択中：
                    {selectedPokemonIds.length} / 3
                </p>
            </section>

            <section className="rounded border p-5">
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
                                        {pokemonMaster?.name || opponent.key}
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
                                const isSelected = lossTags.includes(tag);

                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleToggleLossTag(tag)}
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
                        rows={3}
                        value={reflection}
                        onChange={(event) => setReflection(event.target.value)}
                    />
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium">
                        次回メモ
                    </label>

                    <textarea
                        className="mt-1 w-full rounded border p-3"
                        rows={3}
                        value={nextNote}
                        onChange={(event) => setNextNote(event.target.value)}
                    />
                </div>
            </section>

            <button
                type="submit"
                disabled={
                    isSubmitting ||
                    selectedPokemonIds.length !== 3 ||
                    selectedOpponentPokemonKeys.length < 1
                }
                className="rounded bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting ? submittingLabel : submitLabel}
            </button>
        </form>
    );
}
