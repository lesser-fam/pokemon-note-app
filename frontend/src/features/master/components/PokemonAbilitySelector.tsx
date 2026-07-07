"use client";

import { fetchPokemonAbilitiesByPokemon } from "@/features/master/api/pokemonAbilityApi";
import type { PokemonAbilityGroup } from "@/types/pokemonAbility";
import { useEffect, useState } from "react";

type PokemonAbility = PokemonAbilityGroup["abilities"][number];

type PokemonAbilitySelectorProps = {
    pokemonKey: string;
    formKey: string;
    selectedAbilityId: number | null;
    onSelect: (ability: PokemonAbility) => void;
};

export function PokemonAbilitySelector({
    pokemonKey,
    formKey,
    selectedAbilityId,
    onSelect,
}: PokemonAbilitySelectorProps) {
    const [abilityList, setAbilityList] = useState<PokemonAbility[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!pokemonKey || !formKey) {
            return;
        }

        let isCancelled = false;

        const loadAbilities = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const data = await fetchPokemonAbilitiesByPokemon([
                    `${pokemonKey}:${formKey}`,
                ]);

                if (isCancelled) {
                    return;
                }

                setAbilityList(data[0]?.abilities ?? []);
            } catch (error) {
                console.error(error);

                if (!isCancelled) {
                    setAbilityList([]);
                    setErrorMessage("特性候補の取得に失敗しました。");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadAbilities();

        return () => {
            isCancelled = true;
        };
    }, [pokemonKey, formKey]);

    if (!pokemonKey || !formKey) {
        return (
            <p className="rounded border bg-gray-50 p-3 text-sm text-gray-500">
                先にポケモンを選択してください。
            </p>
        );
    }

    if (isLoading) {
        return (
            <p className="rounded border bg-gray-50 p-3 text-sm text-gray-500">
                特性候補を取得中...
            </p>
        );
    }

    if (errorMessage) {
        return (
            <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
            </p>
        );
    }

    if (abilityList.length === 0) {
        return (
            <p className="rounded border bg-gray-50 p-3 text-sm text-gray-500">
                このポケモンの特性候補が登録されていません。
            </p>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {abilityList.map((ability) => {
                const isSelected = ability.id === selectedAbilityId;

                const description =
                    ability.description || "説明文は未登録です。";

                return (
                    <div key={ability.id} className="group relative">
                        <button
                            type="button"
                            onClick={() => onSelect(ability)}
                            className={`rounded border px-3 py-2 text-sm ${
                                isSelected
                                    ? "border-black bg-black text-white"
                                    : "bg-white hover:bg-gray-50"
                            }`}
                            aria-describedby={`ability-${ability.id}-description`}
                        >
                            {ability.name}

                            {ability.is_hidden && (
                                <span className="ml-1 text-xs">※</span>
                            )}
                        </button>

                        <div
                            id={`ability-${ability.id}-description`}
                            role="tooltip"
                            className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded bg-gray-900 p-2 text-left text-xs leading-relaxed text-white shadow-lg group-hover:block"
                        >
                            <p className="font-semibold">
                                {ability.name}
                                {ability.is_hidden && "（隠れ特性）"}
                            </p>

                            <p className="mt-1">{description}</p>
                        </div>
                    </div>
                );
            })}

            <p className="w-full text-xs text-gray-500">
                ※は隠れ特性です。特性名にマウスを重ねると説明を確認できます。
            </p>
        </div>
    );
}
