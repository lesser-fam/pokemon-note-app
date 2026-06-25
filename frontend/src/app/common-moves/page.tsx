"use client";

import { AppHeader } from "@/components/AppHeader";
import { fetchCurrentUser } from "@/features/auth/api/authApi";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { MoveSelector } from "@/features/master/components/MoveSelector";
import { PokemonSearchSelector } from "@/features/partyPokemon/components/PokemonSearchSelector";
import {
    createPokemonCommonMove,
    deletePokemonCommonMove,
    fetchPokemonCommonMoves,
    importPokemonCommonMoves,
} from "@/features/pokemonCommonMoves/api/pokemonCommonMoveApi";
import type { MoveMaster } from "@/types/battleMaster";
import type { PartyRule } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonCommonMove } from "@/types/pokemonCommonMove";
import type { User } from "@/types/user";
import Link from "next/link";
import { useEffect, useState } from "react";

const getMoveClassLabel = (damageClass: MoveMaster["damage_class"]) => {
    if (damageClass === "physical") {
        return "物理";
    }

    if (damageClass === "special") {
        return "特殊";
    }

    return "変化";
};

export default function CommonMovesPage() {
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(
        null,
    );
    const [commonMoves, setCommonMoves] = useState<PokemonCommonMove[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [sourcePartyId] = useState<number | null>(() => {
        if (typeof window === "undefined") {
            return null;
        }

        const partyIdParam = new URLSearchParams(window.location.search).get(
            "partyId",
        );
        const parsedPartyId = partyIdParam ? Number(partyIdParam) : null;

        if (
            parsedPartyId !== null &&
            Number.isInteger(parsedPartyId) &&
            parsedPartyId > 0
        ) {
            return parsedPartyId;
        }

        return null;
    });

    const [pokemonSearchKeyword, setPokemonSearchKeyword] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [memo, setMemo] = useState("");
    const [moveSearchKeyword, setMoveSearchKeyword] = useState("");
    const [selectedRule, setSelectedRule] = useState<PartyRule>("main_series");
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [importErrors, setImportErrors] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const isAdmin = currentUser?.is_admin === true;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [pokemonData, currentUserData] = await Promise.all([
                    fetchPokemonList(),
                    fetchCurrentUser(),
                ]);

                setPokemonList(pokemonData);
                setCurrentUser(currentUserData);
            } catch (error) {
                console.error(error);
                setErrorMessage("必要なデータの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        const loadCommonMoves = async () => {
            if (!selectedPokemon) {
                setCommonMoves([]);
                return;
            }

            try {
                const data = await fetchPokemonCommonMoves({
                    rule: selectedRule,
                    pokemonKey: selectedPokemon.key,
                    formKey: selectedPokemon.form_key,
                });

                setCommonMoves(data);
            } catch (error) {
                console.error(error);
                setErrorMessage("よく使う技の取得に失敗しました。");
            }
        };

        loadCommonMoves();
    }, [selectedPokemon, selectedRule]);

    const handleSelectPokemon = (pokemon: Pokemon) => {
        setSelectedPokemon(pokemon);
        setPokemonSearchKeyword("");
        setSelectedTypes([]);
        setMemo("");
        setMoveSearchKeyword("");
        setErrorMessage("");
        setSuccessMessage("");
        setImportErrors([]);
    };

    const handleSelectMove = async (move: MoveMaster) => {
        if (!isAdmin) {
            setErrorMessage("よく使う技を登録できるのは管理者のみです。");
            return;
        }

        if (!selectedPokemon || isSaving) {
            return;
        }

        const alreadyRegistered = commonMoves.some(
            (commonMove) => commonMove.move_id === move.id,
        );

        if (alreadyRegistered) {
            setErrorMessage("この技はすでに登録されています。");
            return;
        }

        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const createdCommonMove = await createPokemonCommonMove({
                rule: selectedRule,
                pokemon_key: selectedPokemon.key,
                form_key: selectedPokemon.form_key,
                move_id: move.id,
                memo: memo.trim() || null,
            });

            setCommonMoves((currentMoves) => [
                ...currentMoves,
                createdCommonMove,
            ]);

            setMemo("");
            setMoveSearchKeyword("");
            setSuccessMessage("よく使う技を登録しました。");
        } catch (error) {
            console.error(error);
            setErrorMessage("よく使う技の登録に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (commonMoveId: number) => {
        if (!isAdmin) {
            setErrorMessage("よく使う技を削除できるのは管理者のみです。");
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        try {
            await deletePokemonCommonMove(commonMoveId);

            setCommonMoves((currentMoves) =>
                currentMoves.filter(
                    (commonMove) => commonMove.id !== commonMoveId,
                ),
            );
            setSuccessMessage("よく使う技を削除しました。");
        } catch (error) {
            console.error(error);
            setErrorMessage("よく使う技の削除に失敗しました。");
        }
    };

    const handleChangeRule = (rule: PartyRule) => {
        setSelectedRule(rule);
        setErrorMessage("");
        setSuccessMessage("");
        setImportErrors([]);
    };

    const handleImportCsv = async () => {
        if (!isAdmin) {
            setErrorMessage("CSVインポートできるのは管理者のみです。");
            return;
        }

        if (!csvFile || isImporting) {
            return;
        }

        setIsImporting(true);
        setErrorMessage("");
        setSuccessMessage("");
        setImportErrors([]);

        try {
            const result = await importPokemonCommonMoves(csvFile);

            setImportErrors(result.errors);
            setSuccessMessage(
                `CSVインポートが完了しました。新規${result.imported_count}件、更新${result.updated_count}件、エラー${result.error_count}件`,
            );
            setCsvFile(null);

            if (selectedPokemon) {
                const data = await fetchPokemonCommonMoves({
                    rule: selectedRule,
                    pokemonKey: selectedPokemon.key,
                    formKey: selectedPokemon.form_key,
                });

                setCommonMoves(data);
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("CSVインポートに失敗しました。ヘッダーや技名を確認してください。");
        } finally {
            setIsImporting(false);
        }
    };


    if (isLoading) {
        return (
            <main className="mx-auto max-w-7xl p-6">
                <p>読み込み中...</p>
            </main>
        );
    }

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-7xl p-6">
                <div className="mb-4">
                    <Link
                        href={
                            sourcePartyId
                                ? `/parties/${sourcePartyId}`
                                : "/parties"
                        }
                        className="text-sm text-blue-600"
                    >
                        {sourcePartyId
                            ? "← パーティ詳細へ戻る"
                            : "← パーティ一覧へ戻る"}
                    </Link>
                </div>

                <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold">よく使われる技</h1>

                        {isAdmin && (
                            <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                                管理者
                            </span>
                        )}
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                        相手ポケモンごとによく使われる技を確認できます。
                        登録した技は、今後おすすめ選択肢の交代候補評価に使います。
                    </p>

                    <p className="mt-3 inline-flex rounded bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700">
                        {isAdmin
                            ? "管理者はよく使われる技を登録・削除できます。"
                            : "登録と削除は管理者のみ行えます。"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => handleChangeRule("main_series")}
                            className={`rounded border px-3 py-2 text-sm font-semibold ${
                                selectedRule === "main_series"
                                    ? "border-black bg-white ring-2 ring-black"
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                        >
                            本編ルール
                        </button>

                        <button
                            type="button"
                            onClick={() => handleChangeRule("champions")}
                            className={`rounded border px-3 py-2 text-sm font-semibold ${
                                selectedRule === "champions"
                                    ? "border-black bg-white ring-2 ring-black"
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                        >
                            チャンピオンズ
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                        {errorMessage}
                    </p>
                )}

                {successMessage && (
                    <p className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
                        {successMessage}
                    </p>
                )}

                {importErrors.length > 0 && (
                    <div className="mb-4 rounded bg-yellow-50 p-3 text-sm text-yellow-800">
                        <p className="font-semibold">CSVインポートの確認事項</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            {importErrors.map((importError) => (
                                <li key={importError}>{importError}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {isAdmin && (
                    <section className="mb-6 rounded border bg-white p-4">
                        <h2 className="text-lg font-bold">CSVインポート</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            CSV形式: rule,pokemon_key,form_key,move_name,memo
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(event) =>
                                    setCsvFile(event.target.files?.[0] ?? null)
                                }
                                className="text-sm"
                            />

                            <button
                                type="button"
                                onClick={handleImportCsv}
                                disabled={!csvFile || isImporting}
                                className="rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400"
                            >
                                {isImporting ? "インポート中..." : "CSVをインポート"}
                            </button>
                        </div>
                    </section>
                )}

                <section className="rounded border bg-white p-4">
                    <div>
                        <h2 className="text-lg font-bold">ポケモンを選ぶ</h2>

                        <p className="mt-1 text-sm text-gray-600">
                            よく使う技を確認したいポケモンを選択してください。
                        </p>
                    </div>

                    <div className="mt-4">
                        <PokemonSearchSelector
                            pokemonList={pokemonList}
                            searchKeyword={pokemonSearchKeyword}
                            onChangeSearchKeyword={setPokemonSearchKeyword}
                            clearSearchKeywordOnSelect
                            selectedTypes={selectedTypes}
                            onChangeSelectedTypes={setSelectedTypes}
                            isPokemonSelected={(pokemon) =>
                                selectedPokemon
                                    ? selectedPokemon.key === pokemon.key &&
                                      selectedPokemon.form_key ===
                                          pokemon.form_key
                                    : false
                            }
                            getPokemonStatusLabel={(pokemon) =>
                                selectedPokemon &&
                                selectedPokemon.key === pokemon.key &&
                                selectedPokemon.form_key === pokemon.form_key
                                    ? "選択中"
                                    : null
                            }
                            onSelectPokemon={handleSelectPokemon}
                        />
                    </div>
                </section>

                <div
                    className={`mt-6 grid gap-4 ${
                        isAdmin ? "lg:grid-cols-[20rem_minmax(0,1fr)]" : "lg:grid-cols-[20rem]"
                    }`}
                >
                    <section className="rounded border bg-white p-4">
                        <h2 className="text-lg font-bold">選択中</h2>

                        {selectedPokemon ? (
                            <div className="mt-4 flex items-center gap-3 rounded bg-gray-50 p-3">
                                {selectedPokemon.image_url ? (
                                    <img
                                        src={selectedPokemon.image_url}
                                        alt={selectedPokemon.name}
                                        className="h-16 w-16 shrink-0 object-contain"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-white text-gray-400">
                                        ?
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="truncate font-bold">
                                        {selectedPokemon.name}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-gray-600">
                                        {selectedPokemon.kana}
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {selectedPokemon.types.map((type) => (
                                            <span
                                                key={type}
                                                className="rounded bg-white px-2 py-1 text-xs"
                                            >
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                まだポケモンが選択されていません。
                            </p>
                        )}
                    </section>

                    {isAdmin && (
                        <section className="rounded border bg-white p-4">
                            <h2 className="text-lg font-bold">技を追加する</h2>

                            {selectedPokemon ? (
                                <>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {selectedPokemon.name}
                                        がよく使う技を検索して追加します。
                                    </p>

                                    <div className="mt-4 max-w-xl">
                                        <label className="text-sm font-semibold">
                                            メモ 任意
                                        </label>

                                        <input
                                            value={memo}
                                            onChange={(event) =>
                                                setMemo(event.target.value)
                                            }
                                            placeholder="例：採用率高め、サブウェポン、警戒枠など"
                                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                                        />
                                    </div>

                                    <div className="mt-4 max-w-xl">
                                        <MoveSelector
                                            value={moveSearchKeyword}
                                            onChangeText={setMoveSearchKeyword}
                                            onSelect={handleSelectMove}
                                        />

                                        {isSaving && (
                                            <p className="mt-2 text-xs text-gray-500">
                                                登録中...
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                                    先にポケモンを選択してください。
                                </p>
                            )}
                        </section>
                    )}
                </div>

                <section className="mt-6 rounded border bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold">登録済みの技</h2>
                        </div>

                        {selectedPokemon && (
                            <span className="rounded bg-gray-100 px-3 py-1 text-sm font-semibold">
                                {commonMoves.length} 件
                            </span>
                        )}
                    </div>

                    {!selectedPokemon ? (
                        <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                            ポケモンを選択すると、登録済みの技が表示されます。
                        </p>
                    ) : commonMoves.length === 0 ? (
                        <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                            まだ登録済みの技がありません。
                        </p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-160 text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-left">
                                        <th className="px-3 py-2">技名</th>
                                        <th className="px-3 py-2">タイプ</th>
                                        <th className="px-3 py-2">分類</th>
                                        <th className="px-3 py-2">威力</th>
                                        <th className="px-3 py-2">メモ</th>
                                        {isAdmin && (
                                            <th className="px-3 py-2"></th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {commonMoves.map((commonMove) => (
                                        <tr
                                            key={commonMove.id}
                                            className="border-b"
                                        >
                                            <td className="px-3 py-2 font-semibold">
                                                {commonMove.move_master.name}
                                            </td>

                                            <td className="px-3 py-2">
                                                {commonMove.move_master.type}
                                            </td>

                                            <td className="px-3 py-2">
                                                {getMoveClassLabel(
                                                    commonMove.move_master
                                                        .damage_class,
                                                )}
                                            </td>

                                            <td className="px-3 py-2">
                                                {commonMove.move_master.power ??
                                                    "-"}
                                            </td>

                                            <td className="px-3 py-2 text-gray-600">
                                                {commonMove.memo || "-"}
                                            </td>

                                            {isAdmin && (
                                                <td className="px-3 py-2 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                commonMove.id,
                                                            )
                                                        }
                                                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                                    >
                                                        削除
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
