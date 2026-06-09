"use client";

import { fetchMoveList } from "@/features/master/api/masterApi";
import type { MoveMaster } from "@/types/battleMaster";
import { useEffect, useState } from "react";

type MoveSelectorProps = {
    value: string;
    onChangeText: (value: string) => void;
    onSelect: (move: MoveMaster) => void;
};

export function MoveSelector({
    value,
    onChangeText,
    onSelect,
}: MoveSelectorProps) {
    const [moveList, setMoveList] = useState<MoveMaster[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const keyword = value.trim();

        if (!isOpen || keyword === "") {
            return;
        }

        let isCancelled = false;

        const timerId = window.setTimeout(async () => {
            setIsLoading(true);

            try {
                const data = await fetchMoveList(keyword, 20);

                if (!isCancelled) {
                    setMoveList(data);
                }
            } catch (error) {
                console.error(error);

                if (!isCancelled) {
                    setMoveList([]);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }, 300);

        return () => {
            isCancelled = true;
            window.clearTimeout(timerId);
        };
    }, [value, isOpen]);

    const handleChange = (nextValue: string) => {
        onChangeText(nextValue);

        if (nextValue.trim() === "") {
            setIsOpen(false);
            setMoveList([]);
            return;
        }

        setIsOpen(true);
    };

    const handleSelect = (move: MoveMaster) => {
        setIsOpen(false);
        setMoveList([]);
        onSelect(move);
    };

    return (
        <div className="relative">
            <input
                className="w-full rounded border px-3 py-2"
                value={value}
                onChange={(event) => handleChange(event.target.value)}
                onFocus={() => {
                    if (value.trim() !== "") {
                        setIsOpen(true);
                    }
                }}
                placeholder="技名を検索"
            />

            {isOpen && (
                <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded border bg-white shadow-lg">
                    {isLoading ? (
                        <p className="p-3 text-sm text-gray-600">検索中...</p>
                    ) : moveList.length > 0 ? (
                        moveList.map((move) => (
                            <button
                                key={move.id}
                                type="button"
                                onClick={() => handleSelect(move)}
                                className="block w-full border-b px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                                <span className="font-medium">{move.name}</span>

                                <span className="ml-2 text-xs text-gray-500">
                                    {move.type} /{" "}
                                    {move.damage_class === "physical"
                                        ? "物理"
                                        : move.damage_class === "special"
                                          ? "特殊"
                                          : "変化"}
                                    {move.power !== null &&
                                        ` / 威力 ${move.power}`}
                                </span>
                            </button>
                        ))
                    ) : (
                        <p className="p-3 text-sm text-gray-600">
                            候補が見つかりません。
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
