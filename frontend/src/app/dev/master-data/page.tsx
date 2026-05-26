"use client";

import { useEffect, useState } from "react";
import {
    fetchPokemonList,
    fetchRoleTags,
} from "@/features/master/api/masterApi";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";

export default function MasterDataPage() {
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [roleTags, setRoleTags] = useState<RoleTag[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [pokemon, tags] = await Promise.all([
                    fetchPokemonList(),
                    fetchRoleTags(),
                ]);

                setPokemonList(pokemon);
                setRoleTags(tags);
            } catch (error) {
                console.error(error);
                setErrorMessage("データ取得に失敗しました。");
            }
        };

        fetchMasterData();
    }, []);

    return (
        <main className="mx-auto max-w-5xl p-8">
            <h1 className="text-2xl font-bold">マスターデータ確認</h1>

            {errorMessage && (
                <p className="mt-4 rounded bg-red-100 p-3 text-red-700">
                    {errorMessage}
                </p>
            )}

            <section className="mt-8">
                <h2 className="text-xl font-semibold">
                    ポケモン一覧：{pokemonList.length}件
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {pokemonList.map((pokemon) => (
                        <div
                            key={`${pokemon.key}-${pokemon.form_key}`}
                            className="rounded border p-4"
                        >
                            {pokemon.image_url && (
                                <img
                                    src={pokemon.image_url}
                                    alt={pokemon.name}
                                    className="h-20 w-20 object-contain"
                                />
                            )}

                            <p className="mt-2 font-bold">{pokemon.name}</p>
                            <p className="text-sm text-gray-600">
                                {pokemon.kana}
                            </p>
                            <p className="text-sm">
                                {pokemon.types.join(" / ")}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                H{pokemon.base_stats.h} A{pokemon.base_stats.a}{" "}
                                B{pokemon.base_stats.b} C{pokemon.base_stats.c}{" "}
                                D{pokemon.base_stats.d} S{pokemon.base_stats.s}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold">
                    役割タグ一覧：{roleTags.length}件
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {roleTags.map((tag) => (
                        <div key={tag.key} className="rounded border p-4">
                            <p className="font-bold">{tag.name}</p>
                            <p className="mt-1 text-sm text-gray-700">
                                {tag.description}
                            </p>

                            <p className="mt-2 text-xs text-gray-500">
                                初手 {tag.lead_score} / 引き先{" "}
                                {tag.switch_score} / 勝ち筋 {tag.finisher_score}
                            </p>

                            {tag.examples && (
                                <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                                    {tag.examples.map((example) => (
                                        <li key={example}>{example}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
