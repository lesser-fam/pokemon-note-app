"use client";

import { fetchPokemonAbilityWarnings } from "@/features/master/api/pokemonAbilityWarningApi";
import type { PokemonAbilityWarning } from "@/types/pokemonAbilityWarning";
import { useEffect, useState } from "react";

type PokemonAbility = PokemonAbilityWarning["abilities"][number];

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
                const data = await fetchPokemonAbilityWarnings([
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

                return (
                    <button
                        key={ability.id}
                        type="button"
                        onClick={() => onSelect(ability)}
                        className={`rounded border px-3 py-2 text-sm ${
                            isSelected
                                ? "border-black bg-black text-white"
                                : "bg-white hover:bg-gray-50"
                        }`}
                    >
                        {ability.name}
                        {ability.is_hidden && (
                            <span className="ml-1 text-xs">※</span>
                        )}
                    </button>
                );
            })}

            <p className="w-full text-xs text-gray-500">※は隠れ特性です。</p>
        </div>
    );
}
