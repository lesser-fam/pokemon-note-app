"use client";

import { AppHeader } from "@/components/AppHeader";
import { fetchParty } from "@/features/parties/api/partyApi";
import { updateSelectionTemplate } from "@/features/selectionTemplates/api/selectionTemplateApi";
import type { Party, SelectionTemplate } from "@/types/party";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function EditSelectionTemplatePage() {
    const router = useRouter();
    const params = useParams<{
        partyId: string;
        selectionTemplateId: string;
    }>();

    const partyId = Number(params.partyId);
    const selectionTemplateId = Number(params.selectionTemplateId);

    const isInvalidPartyId = Number.isNaN(partyId);
    const isInvalidSelectionTemplateId = Number.isNaN(selectionTemplateId);

    const [party, setParty] = useState<Party | null>(null);
    const [selectionTemplate, setSelectionTemplate] =
        useState<SelectionTemplate | null>(null);

    const [name, setName] = useState("");
    const [leadPokemonId, setLeadPokemonId] = useState("");
    const [switchPokemonId, setSwitchPokemonId] = useState("");
    const [finisherPokemonId, setFinisherPokemonId] = useState("");
    const [memo, setMemo] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const partyData = await fetchParty(partyId);
                const templates =
                    partyData.current_version?.selection_templates ?? [];

                const foundTemplate = templates.find(
                    (template) => template.id === selectionTemplateId,
                );

                if (!foundTemplate) {
                    setErrorMessage("基本選出が見つかりません。");
                    return;
                }

                setParty(partyData);
                setSelectionTemplate(foundTemplate);
                setName(foundTemplate.name);
                setLeadPokemonId(String(foundTemplate.lead_pokemon?.id ?? ""));
                setSwitchPokemonId(
                    String(foundTemplate.switch_pokemon?.id ?? ""),
                );
                setFinisherPokemonId(
                    String(foundTemplate.finisher_pokemon?.id ?? ""),
                );
                setMemo(foundTemplate.memo || "");
            } catch (error) {
                console.error(error);
                setErrorMessage("基本選出の取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (isInvalidPartyId || isInvalidSelectionTemplateId) {
            return;
        }

        loadData();
    }, [
        partyId,
        selectionTemplateId,
        isInvalidPartyId,
        isInvalidSelectionTemplateId,
    ]);

    const currentPokemonList = party?.current_version?.pokemon ?? [];

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!party || !selectionTemplate) {
            setErrorMessage("基本選出が見つかりません。");
            return;
        }

        if (!name.trim()) {
            setErrorMessage("基本選出名を入力してください。");
            return;
        }

        if (!leadPokemonId || !switchPokemonId || !finisherPokemonId) {
            setErrorMessage("初手・引き先・勝ち筋をすべて選択してください。");
            return;
        }

        const selectedIds = [
            Number(leadPokemonId),
            Number(switchPokemonId),
            Number(finisherPokemonId),
        ];

        if (new Set(selectedIds).size !== 3) {
            setErrorMessage(
                "同じポケモンを複数の枠に選択することはできません。",
            );
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await updateSelectionTemplate(selectionTemplate.id, {
                name: name.trim(),
                lead_pokemon_id: Number(leadPokemonId),
                switch_pokemon_id: Number(switchPokemonId),
                finisher_pokemon_id: Number(finisherPokemonId),
                memo: memo.trim() || undefined,
            });

            router.push(`/parties/${party.id}`);
        } catch (error) {
            console.error(error);
            setErrorMessage("基本選出の更新に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isInvalidPartyId || isInvalidSelectionTemplateId) {
        return (
            <>
                <AppHeader />
                <main className="mx-auto max-w-3xl p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        IDが正しくありません。
                    </p>
                </main>
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <AppHeader />
                <main className="mx-auto max-w-3xl p-8">
                    <p>読み込み中...</p>
                </main>
            </>
        );
    }

    if (!party || !selectionTemplate) {
        return (
            <>
                <AppHeader />
                <main className="mx-auto max-w-3xl p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        {errorMessage || "基本選出が見つかりません。"}
                    </p>
                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-3xl p-8">
                <Link
                    href={`/parties/${party.id}`}
                    className="text-sm text-blue-600"
                >
                    ← パーティ詳細へ戻る
                </Link>

                <div className="mt-4 rounded border p-6">
                    <h1 className="text-2xl font-bold">基本選出編集</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        保存済みの基本選出を編集します。
                    </p>

                    {errorMessage && (
                        <p className="mt-6 rounded bg-red-100 p-3 text-red-700">
                            {errorMessage}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium">
                                基本選出名
                            </label>
                            <input
                                className="mt-1 w-full rounded border p-3"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium">
                                    初手
                                </label>
                                <select
                                    className="mt-1 w-full rounded border p-3"
                                    value={leadPokemonId}
                                    onChange={(event) =>
                                        setLeadPokemonId(event.target.value)
                                    }
                                >
                                    <option value="">選択してください</option>
                                    {currentPokemonList.map((pokemon) => (
                                        <option
                                            key={pokemon.id}
                                            value={pokemon.id}
                                        >
                                            {pokemon.nickname ||
                                                pokemon.pokemon_key}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    引き先
                                </label>
                                <select
                                    className="mt-1 w-full rounded border p-3"
                                    value={switchPokemonId}
                                    onChange={(event) =>
                                        setSwitchPokemonId(event.target.value)
                                    }
                                >
                                    <option value="">選択してください</option>
                                    {currentPokemonList.map((pokemon) => (
                                        <option
                                            key={pokemon.id}
                                            value={pokemon.id}
                                        >
                                            {pokemon.nickname ||
                                                pokemon.pokemon_key}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium">
                                    勝ち筋
                                </label>
                                <select
                                    className="mt-1 w-full rounded border p-3"
                                    value={finisherPokemonId}
                                    onChange={(event) =>
                                        setFinisherPokemonId(event.target.value)
                                    }
                                >
                                    <option value="">選択してください</option>
                                    {currentPokemonList.map((pokemon) => (
                                        <option
                                            key={pokemon.id}
                                            value={pokemon.id}
                                        >
                                            {pokemon.nickname ||
                                                pokemon.pokemon_key}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                メモ
                            </label>
                            <textarea
                                className="mt-1 w-full rounded border p-3"
                                value={memo}
                                onChange={(event) =>
                                    setMemo(event.target.value)
                                }
                                rows={4}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded bg-black px-5 py-3 text-white disabled:opacity-50"
                            >
                                {isSubmitting ? "保存中..." : "保存する"}
                            </button>

                            <Link
                                href={`/parties/${party.id}`}
                                className="rounded border px-5 py-3 text-sm hover:bg-gray-50"
                            >
                                キャンセル
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
