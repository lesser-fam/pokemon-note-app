"use client";

import { AppHeader } from "@/components/AppHeader";
import { summarizeBattleLogs } from "@/features/battleLogs/utils/summarizeBattleLogs";
import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import { suggestBasicSelection } from "@/features/selections/utils/suggestBasicSelection";
import { createSelectionTemplate } from "@/features/selectionTemplates/api/selectionTemplateApi";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PartyDetailPage() {
    const params = useParams<{ partyId: string }>();
    const partyId = Number(params.partyId);
    const isInvalidPartyId = Number.isNaN(partyId);

    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingSelection, setIsSavingSelection] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadParty = async () => {
            try {
                const [partyData, pokemonData] = await Promise.all([
                    fetchParty(partyId),
                    fetchPokemonList(),
                ]);

                setParty(partyData);
                setPokemonList(pokemonData);
            } catch (error) {
                console.error(error);
                setErrorMessage("パーティ詳細の取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (isInvalidPartyId) {
            return;
        }

        loadParty();
    }, [partyId, isInvalidPartyId]);

    if (isInvalidPartyId) {
        return (
            <main className="mx-auto max-w-5x1 p-8">
                <p className="rounded bg-red-100 p-3 text-red-700">
                    パーティIDが正しくありません。
                </p>
            </main>
        );
    }

    const findPokemonMaster = (pokemonKey: string, formKey: string) => {
        return pokemonList.find(
            (pokemon) =>
                pokemon.key === pokemonKey && pokemon.form_key === formKey,
        );
    };

    const getPokemonMasterName = (pokemonKey: string, formKey = "default") => {
        const pokemonMaster = findPokemonMaster(pokemonKey, formKey);

        return pokemonMaster?.name || pokemonKey;
    };

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

    if (errorMessage || !party) {
        return (
            <>
                <AppHeader />

                <main className="mx-auto max-w-5xl p-8">
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        {errorMessage || "パーティが見つかりません。"}
                    </p>
                </main>
            </>
        );
    }

    const getBattleRuleLabel = (rule: string | null) => {
        if (rule === "champions") {
            return "チャンピオンズ";
        }

        return "本編ルール";
    };

    const currentPokemonList = party.current_version?.pokemon ?? [];
    const suggestedSelection = suggestBasicSelection(currentPokemonList);
    const battleLogs = party.current_version?.battle_logs ?? [];
    const battleLogSummary = summarizeBattleLogs(battleLogs);

    const handleSaveSuggestedSelection = async () => {
        if (!party.current_version) {
            setErrorMessage("現在のバージョンが見つかりません。");
            return;
        }

        const lead = suggestedSelection.find(
            (suggestion) => suggestion.role === "lead",
        );
        const switchPokemon = suggestedSelection.find(
            (suggestion) => suggestion.role === "switch",
        );
        const finisher = suggestedSelection.find(
            (suggestion) => suggestion.role === "finisher",
        );

        if (!lead?.pokemon || !switchPokemon?.pokemon || !finisher?.pokemon) {
            setErrorMessage("保存できる基本選出がありません。");
            return;
        }

        setIsSavingSelection(true);
        setErrorMessage("");

        try {
            await createSelectionTemplate(party.current_version.id, {
                name: "おすすめ基本選出",
                lead_pokemon_id: lead.pokemon.id,
                switch_pokemon_id: switchPokemon.pokemon.id,
                finisher_pokemon_id: finisher.pokemon.id,
                memo: "役割タグの点数から自動提案された基本選出です。",
            });

            const refreshedParty = await fetchParty(party.id);
            setParty(refreshedParty);
        } catch (error) {
            console.error(error);
            setErrorMessage("基本選出の保存に失敗しました。");
        } finally {
            setIsSavingSelection(false);
        }
    };

    return (
        <>
            <AppHeader />

            <main className="mx-auto max-w-5xl p-8">
                <Link href="/parties" className="text-sm text-blue-600">
                    ← パーティ一覧へ戻る
                </Link>

                <div className="mt-4 rounded border p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                    {getBattleRuleLabel(party.rule)}
                                </span>

                                {party.current_version && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                        現在のバージョン：v
                                        {party.current_version.version_number}
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-3 break-words text-2xl font-bold">
                                {party.name}
                            </h1>
                        </div>

                        <div className="flex flex-wrap gap-3 md:justify-end">
                            <Link
                                href={`/parties/${party.id}/versions/create`}
                                className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                            >
                                新バージョン作成
                            </Link>

                            <Link
                                href={`/parties/${party.id}/battle-preview`}
                                className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
                            >
                                対戦前選出へ
                            </Link>
                        </div>
                    </div>

                    {party.concept && (
                        <div className="mt-6">
                            <h2 className="font-semibold">コンセプト</h2>
                            <p className="mt-1 text-gray-700">
                                {party.concept}
                            </p>
                        </div>
                    )}

                    {party.memo && (
                        <div className="mt-6">
                            <h2 className="font-semibold">メモ</h2>
                            <p className="mt-1 text-gray-700">{party.memo}</p>
                        </div>
                    )}
                </div>

                <section className="mt-8 rounded border p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold">
                                おすすめ基本選出
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                役割タグの点数から、初手・引き先・勝ち筋を仮提案します。
                            </p>
                        </div>

                        {currentPokemonList.length >= 3 && (
                            <button
                                type="button"
                                onClick={handleSaveSuggestedSelection}
                                disabled={isSavingSelection}
                                className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                            >
                                {isSavingSelection
                                    ? "保存中..."
                                    : "この基本選出を保存"}
                            </button>
                        )}
                    </div>

                    {currentPokemonList.length < 3 ? (
                        <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                            基本選出を提案するには、ポケモンを3匹以上登録してください。
                        </p>
                    ) : (
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            {suggestedSelection.map((suggestion) => {
                                const pokemonMaster = suggestion.pokemon
                                    ? findPokemonMaster(
                                          suggestion.pokemon.pokemon_key,
                                          suggestion.pokemon.form_key,
                                      )
                                    : null;

                                return (
                                    <div
                                        key={suggestion.role}
                                        className="rounded border p-4"
                                    >
                                        <p className="text-sm font-semibold text-gray-500">
                                            {suggestion.label}
                                        </p>

                                        {suggestion.pokemon ? (
                                            <>
                                                <div className="mt-3 flex items-center gap-3">
                                                    {pokemonMaster?.image_url ? (
                                                        <img
                                                            src={
                                                                pokemonMaster.image_url
                                                            }
                                                            alt={
                                                                pokemonMaster.name
                                                            }
                                                            className="h-16 w-16 object-contain"
                                                        />
                                                    ) : (
                                                        <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                                                            ?
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="font-bold">
                                                            {suggestion.pokemon
                                                                .nickname ||
                                                                pokemonMaster?.name ||
                                                                suggestion
                                                                    .pokemon
                                                                    .pokemon_key}
                                                        </p>

                                                        {pokemonMaster && (
                                                            <p className="mt-1 text-xs text-gray-600">
                                                                {pokemonMaster.types.join(
                                                                    " / ",
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="mt-3 text-sm text-gray-700">
                                                    {suggestion.reason}
                                                </p>

                                                <p className="mt-2 text-xs text-gray-500">
                                                    点数：{suggestion.score}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="mt-3 text-sm text-gray-600">
                                                候補がありません。
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="mt-8 rounded border p-6">
                    <h2 className="text-xl font-bold">保存済み基本選出</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        保存した基本選出です。対戦前の選出候補として使います。
                    </p>

                    {party.current_version?.selection_templates &&
                    party.current_version.selection_templates.length > 0 ? (
                        <div className="mt-4 space-y-4">
                            {party.current_version.selection_templates.map(
                                (template) => {
                                    const leadMaster = template.lead_pokemon
                                        ? findPokemonMaster(
                                              template.lead_pokemon.pokemon_key,
                                              template.lead_pokemon.form_key,
                                          )
                                        : null;

                                    const switchMaster = template.switch_pokemon
                                        ? findPokemonMaster(
                                              template.switch_pokemon
                                                  .pokemon_key,
                                              template.switch_pokemon.form_key,
                                          )
                                        : null;

                                    const finisherMaster =
                                        template.finisher_pokemon
                                            ? findPokemonMaster(
                                                  template.finisher_pokemon
                                                      .pokemon_key,
                                                  template.finisher_pokemon
                                                      .form_key,
                                              )
                                            : null;

                                    return (
                                        <div
                                            key={template.id}
                                            className="rounded bg-gray-50 p-4"
                                        >
                                            <p className="font-bold">
                                                {template.name}
                                            </p>

                                            {template.memo && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {template.memo}
                                                </p>
                                            )}

                                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                                                <div className="rounded bg-white p-3">
                                                    <p className="text-xs text-gray-500">
                                                        初手
                                                    </p>

                                                    <div className="mt-2 flex items-center gap-3">
                                                        {leadMaster?.image_url ? (
                                                            <img
                                                                src={
                                                                    leadMaster.image_url
                                                                }
                                                                alt={
                                                                    leadMaster.name
                                                                }
                                                                className="h-14 w-14 object-contain"
                                                            />
                                                        ) : (
                                                            <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                                                                ?
                                                            </div>
                                                        )}

                                                        <div>
                                                            <p className="font-semibold">
                                                                {template
                                                                    .lead_pokemon
                                                                    ?.nickname ||
                                                                    leadMaster?.name ||
                                                                    template
                                                                        .lead_pokemon
                                                                        ?.pokemon_key ||
                                                                    "未設定"}
                                                            </p>

                                                            {leadMaster && (
                                                                <p className="mt-1 text-xs text-gray-600">
                                                                    {leadMaster.types.join(
                                                                        " / ",
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded bg-white p-3">
                                                    <p className="text-xs text-gray-500">
                                                        引き先
                                                    </p>

                                                    <div className="mt-2 flex items-center gap-3">
                                                        {switchMaster?.image_url ? (
                                                            <img
                                                                src={
                                                                    switchMaster.image_url
                                                                }
                                                                alt={
                                                                    switchMaster.name
                                                                }
                                                                className="h-14 w-14 object-contain"
                                                            />
                                                        ) : (
                                                            <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                                                                ?
                                                            </div>
                                                        )}

                                                        <div>
                                                            <p className="font-semibold">
                                                                {template
                                                                    .switch_pokemon
                                                                    ?.nickname ||
                                                                    switchMaster?.name ||
                                                                    template
                                                                        .switch_pokemon
                                                                        ?.pokemon_key ||
                                                                    "未設定"}
                                                            </p>

                                                            {switchMaster && (
                                                                <p className="mt-1 text-xs text-gray-600">
                                                                    {switchMaster.types.join(
                                                                        " / ",
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded bg-white p-3">
                                                    <p className="text-xs text-gray-500">
                                                        勝ち筋
                                                    </p>

                                                    <div className="mt-2 flex items-center gap-3">
                                                        {finisherMaster?.image_url ? (
                                                            <img
                                                                src={
                                                                    finisherMaster.image_url
                                                                }
                                                                alt={
                                                                    finisherMaster.name
                                                                }
                                                                className="h-14 w-14 object-contain"
                                                            />
                                                        ) : (
                                                            <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                                                                ?
                                                            </div>
                                                        )}

                                                        <div>
                                                            <p className="font-semibold">
                                                                {template
                                                                    .finisher_pokemon
                                                                    ?.nickname ||
                                                                    finisherMaster?.name ||
                                                                    template
                                                                        .finisher_pokemon
                                                                        ?.pokemon_key ||
                                                                    "未設定"}
                                                            </p>

                                                            {finisherMaster && (
                                                                <p className="mt-1 text-xs text-gray-600">
                                                                    {finisherMaster.types.join(
                                                                        " / ",
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    ) : (
                        <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                            まだ基本選出は保存されていません。
                        </p>
                    )}
                </section>

                <section className="mt-8 rounded border p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">登録ポケモン</h2>

                        <Link
                            href={`/parties/${party.id}/pokemon/create`}
                            className="rounded bg-black px-4 py-2 text-white"
                        >
                            ポケモンを追加
                        </Link>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {party.current_version?.pokemon &&
                        party.current_version.pokemon.length > 0 ? (
                            party.current_version.pokemon.map((pokemon) => {
                                const pokemonMaster = findPokemonMaster(
                                    pokemon.pokemon_key,
                                    pokemon.form_key,
                                );

                                return (
                                    <div
                                        key={pokemon.id}
                                        className="rounded border p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            {pokemonMaster?.image_url ? (
                                                <img
                                                    src={
                                                        pokemonMaster.image_url
                                                    }
                                                    alt={pokemonMaster.name}
                                                    className="h-20 w-20 object-contain"
                                                />
                                            ) : (
                                                <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-100 text-sm text-gray-500">
                                                    ?
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-lg font-bold">
                                                    {pokemon.nickname ||
                                                        pokemonMaster?.name ||
                                                        pokemon.pokemon_key}
                                                </p>

                                                {pokemonMaster && (
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {pokemonMaster.types.join(
                                                            " / ",
                                                        )}
                                                    </p>
                                                )}

                                                <p className="mt-1 text-xs text-gray-400">
                                                    key: {pokemon.pokemon_key} /
                                                    form: {pokemon.form_key}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-2 text-sm text-gray-700">
                                            {pokemon.item && (
                                                <p>持ち物：{pokemon.item}</p>
                                            )}
                                            {pokemon.ability && (
                                                <p>特性：{pokemon.ability}</p>
                                            )}
                                            {pokemon.nature && (
                                                <p>性格：{pokemon.nature}</p>
                                            )}
                                        </div>

                                        <div className="mt-4 text-sm text-gray-700">
                                            <p className="font-medium">技</p>
                                            <ul className="mt-1 ml-4 list-disc">
                                                {[
                                                    pokemon.move_1,
                                                    pokemon.move_2,
                                                    pokemon.move_3,
                                                    pokemon.move_4,
                                                ]
                                                    .filter(Boolean)
                                                    .map((move) => (
                                                        <li key={move}>
                                                            {move}
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>

                                        {pokemon.role_tags &&
                                            pokemon.role_tags.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {pokemon.role_tags.map(
                                                        (tag) => (
                                                            <span
                                                                key={tag.id}
                                                                className="rounded bg-gray-100 px-2 py-1 text-xs"
                                                            >
                                                                {tag.name}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-600">
                                まだポケモンが登録されていません。
                            </p>
                        )}
                    </div>
                </section>

                <section className="mt-8 rounded border p-6">
                    <h2 className="text-xl font-bold">対戦ログ集計</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        保存した対戦ログから、勝率やよく出る反省ポイントを確認できます。
                    </p>

                    {battleLogSummary.totalBattles === 0 ? (
                        <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                            対戦ログを保存すると、ここに集計が表示されます。
                        </p>
                    ) : (
                        <div className="mt-4 space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">
                                        対戦数
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        {battleLogSummary.totalBattles}
                                    </p>
                                </div>

                                <div className="rounded bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">
                                        勝敗
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        {battleLogSummary.winCount}勝 /{" "}
                                        {battleLogSummary.loseCount}敗
                                    </p>
                                </div>

                                <div className="rounded bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">
                                        勝率
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        {battleLogSummary.winRate}%
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded bg-gray-50 p-4">
                                    <h3 className="font-bold">
                                        よく重かった相手
                                    </h3>

                                    {battleLogSummary.heavyOpponentCounts
                                        .length > 0 ? (
                                        <div className="mt-3 space-y-2">
                                            {battleLogSummary.heavyOpponentCounts
                                                .slice(0, 3)
                                                .map((item) => {
                                                    const [
                                                        pokemonKey,
                                                        formKey,
                                                    ] = item.key.split(":");

                                                    return (
                                                        <div
                                                            key={item.key}
                                                            className="flex justify-between rounded bg-white px-3 py-2 text-sm"
                                                        >
                                                            <span>
                                                                {getPokemonMasterName(
                                                                    pokemonKey,
                                                                    formKey,
                                                                )}
                                                            </span>
                                                            <span>
                                                                {item.count}回
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm text-gray-600">
                                            まだ記録がありません。
                                        </p>
                                    )}
                                </div>

                                <div className="rounded bg-gray-50 p-4">
                                    <h3 className="font-bold">
                                        よく必要だった味方
                                    </h3>

                                    {battleLogSummary.neededPokemonCounts
                                        .length > 0 ? (
                                        <div className="mt-3 space-y-2">
                                            {battleLogSummary.neededPokemonCounts
                                                .slice(0, 3)
                                                .map((item) => (
                                                    <div
                                                        key={item.key}
                                                        className="flex justify-between rounded bg-white px-3 py-2 text-sm"
                                                    >
                                                        <span>
                                                            {(() => {
                                                                const battleLog =
                                                                    battleLogs.find(
                                                                        (log) =>
                                                                            String(
                                                                                log
                                                                                    .needed_pokemon
                                                                                    ?.id,
                                                                            ) ===
                                                                            item.key,
                                                                    );

                                                                if (
                                                                    !battleLog?.needed_pokemon
                                                                ) {
                                                                    return item.label;
                                                                }

                                                                const pokemonMaster =
                                                                    findPokemonMaster(
                                                                        battleLog
                                                                            .needed_pokemon
                                                                            .pokemon_key,
                                                                        battleLog
                                                                            .needed_pokemon
                                                                            .form_key,
                                                                    );

                                                                return (
                                                                    battleLog
                                                                        .needed_pokemon
                                                                        .nickname ||
                                                                    pokemonMaster?.name ||
                                                                    battleLog
                                                                        .needed_pokemon
                                                                        .pokemon_key
                                                                );
                                                            })()}
                                                        </span>
                                                        <span>
                                                            {item.count}回
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm text-gray-600">
                                            まだ記録がありません。
                                        </p>
                                    )}
                                </div>

                                <div className="rounded bg-gray-50 p-4">
                                    <h3 className="font-bold">
                                        よく出る敗因タグ
                                    </h3>

                                    {battleLogSummary.lossTagCounts.length >
                                    0 ? (
                                        <div className="mt-3 space-y-2">
                                            {battleLogSummary.lossTagCounts
                                                .slice(0, 5)
                                                .map((item) => (
                                                    <div
                                                        key={item.key}
                                                        className="flex justify-between rounded bg-white px-3 py-2 text-sm"
                                                    >
                                                        <span>
                                                            {item.label}
                                                        </span>
                                                        <span>
                                                            {item.count}回
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm text-gray-600">
                                            まだ記録がありません。
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="mt-8 rounded border p-6">
                    <h2 className="text-xl font-bold">対戦ログ</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        保存した対戦結果と反省メモを確認できます。
                    </p>

                    {party.current_version?.battle_logs &&
                    party.current_version.battle_logs.length > 0 ? (
                        <div className="mt-4 max-h-180 space-y-4 overflow-y-auto pr-2">
                            {[...party.current_version.battle_logs]
                                .sort(
                                    (a, b) =>
                                        new Date(b.created_at).getTime() -
                                        new Date(a.created_at).getTime(),
                                )
                                .map((battleLog) => (
                                    <div
                                        key={battleLog.id}
                                        className="rounded bg-gray-50 p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-bold">
                                                    {battleLog.result === "win"
                                                        ? "勝ち"
                                                        : "負け"}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {new Date(
                                                        battleLog.created_at,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded px-3 py-1 text-sm ${
                                                    battleLog.result === "win"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {battleLog.result === "win"
                                                    ? "WIN"
                                                    : "LOSE"}
                                            </span>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-sm font-semibold">
                                                相手パーティ
                                            </p>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {[
                                                    [
                                                        battleLog.opponent_pokemon_1,
                                                        battleLog.opponent_form_1,
                                                    ],
                                                    [
                                                        battleLog.opponent_pokemon_2,
                                                        battleLog.opponent_form_2,
                                                    ],
                                                    [
                                                        battleLog.opponent_pokemon_3,
                                                        battleLog.opponent_form_3,
                                                    ],
                                                    [
                                                        battleLog.opponent_pokemon_4,
                                                        battleLog.opponent_form_4,
                                                    ],
                                                    [
                                                        battleLog.opponent_pokemon_5,
                                                        battleLog.opponent_form_5,
                                                    ],
                                                    [
                                                        battleLog.opponent_pokemon_6,
                                                        battleLog.opponent_form_6,
                                                    ],
                                                ]
                                                    .filter(
                                                        ([pokemonKey]) =>
                                                            pokemonKey,
                                                    )
                                                    .map(
                                                        ([
                                                            pokemonKey,
                                                            formKey,
                                                        ]) => {
                                                            const pokemonMaster =
                                                                findPokemonMaster(
                                                                    pokemonKey as string,
                                                                    (formKey as string) ||
                                                                        "default",
                                                                );

                                                            return (
                                                                <div
                                                                    key={`${pokemonKey}-${formKey}`}
                                                                    className="flex items-center gap-2 rounded bg-white px-3 py-2 text-sm"
                                                                >
                                                                    {pokemonMaster?.image_url && (
                                                                        <img
                                                                            src={
                                                                                pokemonMaster.image_url
                                                                            }
                                                                            alt={
                                                                                pokemonMaster.name
                                                                            }
                                                                            className="h-8 w-8 object-contain"
                                                                        />
                                                                    )}

                                                                    <span>
                                                                        {pokemonMaster?.name ||
                                                                            pokemonKey}
                                                                    </span>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-sm font-semibold">
                                                自分の選出
                                            </p>

                                            <div className="mt-2 grid gap-2 md:grid-cols-3">
                                                {[
                                                    battleLog.selected_pokemon1,
                                                    battleLog.selected_pokemon2,
                                                    battleLog.selected_pokemon3,
                                                ]
                                                    .filter(Boolean)
                                                    .map((partyPokemon) => {
                                                        const pokemonMaster =
                                                            findPokemonMaster(
                                                                partyPokemon!
                                                                    .pokemon_key,
                                                                partyPokemon!
                                                                    .form_key,
                                                            );

                                                        return (
                                                            <div
                                                                key={
                                                                    partyPokemon!
                                                                        .id
                                                                }
                                                                className="rounded bg-white p-3 text-sm"
                                                            >
                                                                <p className="font-semibold">
                                                                    {partyPokemon!
                                                                        .nickname ||
                                                                        pokemonMaster?.name ||
                                                                        partyPokemon!
                                                                            .pokemon_key}
                                                                </p>

                                                                {pokemonMaster && (
                                                                    <p className="mt-1 text-xs text-gray-600">
                                                                        {pokemonMaster.types.join(
                                                                            " / ",
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>

                                        {battleLog.heavy_opponent_key && (
                                            <div className="mt-4 text-sm">
                                                <span className="font-semibold">
                                                    重かった相手：
                                                </span>
                                                {(() => {
                                                    const pokemonMaster =
                                                        findPokemonMaster(
                                                            battleLog.heavy_opponent_key,
                                                            battleLog.heavy_opponent_form ||
                                                                "default",
                                                        );

                                                    return (
                                                        pokemonMaster?.name ||
                                                        battleLog.heavy_opponent_key
                                                    );
                                                })()}
                                            </div>
                                        )}

                                        {battleLog.needed_pokemon && (
                                            <div className="mt-2 text-sm">
                                                <span className="font-semibold">
                                                    必要だった味方：
                                                </span>
                                                {(() => {
                                                    const pokemonMaster =
                                                        findPokemonMaster(
                                                            battleLog
                                                                .needed_pokemon!
                                                                .pokemon_key,
                                                            battleLog
                                                                .needed_pokemon!
                                                                .form_key,
                                                        );

                                                    return (
                                                        battleLog
                                                            .needed_pokemon!
                                                            .nickname ||
                                                        pokemonMaster?.name ||
                                                        battleLog
                                                            .needed_pokemon!
                                                            .pokemon_key
                                                    );
                                                })()}
                                            </div>
                                        )}

                                        {battleLog.loss_tags &&
                                            battleLog.loss_tags.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {battleLog.loss_tags.map(
                                                        (tag) => (
                                                            <span
                                                                key={tag}
                                                                className="rounded bg-white px-2 py-1 text-xs"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                        {battleLog.reflection && (
                                            <div className="mt-4">
                                                <p className="text-sm font-semibold">
                                                    反省メモ
                                                </p>
                                                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                                                    {battleLog.reflection}
                                                </p>
                                            </div>
                                        )}

                                        {battleLog.next_note && (
                                            <div className="mt-4">
                                                <p className="text-sm font-semibold">
                                                    次回メモ
                                                </p>
                                                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                                                    {battleLog.next_note}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                            まだ対戦ログはありません。
                        </p>
                    )}
                </section>

                <section className="mt-8 rounded border p-6">
                    <h2 className="text-xl font-bold">バージョン履歴</h2>

                    <div className="mt-4 space-y-3">
                        {party.versions?.map((version) => (
                            <div
                                key={version.id}
                                className="rounded bg-gray-50 p-4"
                            >
                                <p className="font-semibold">
                                    v{version.version_number}
                                    {version.is_current && "（現在）"}
                                </p>
                                {version.change_note && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        {version.change_note}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
