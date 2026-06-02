"use client";

import { fetchMoveList } from "@/features/master/api/masterApi";
import type { MoveMaster } from "@/types/battleMaster";
import { useEffect, useState } from "react";

type MoveSelectorProps = {
    value: string;
    selectedMoveType: string;
    onSelect: (move: MoveMaster | null) => void;
};

export function MoveSelector({
    value,
    selectedMoveType,
    onSelect,
}: MoveSelectorProps) {
    const [searchKeyword, setSearchKeyword] = useState(value);
    const [moveList, setMoveList] = useState<MoveMaster[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setSearchKeyword(value);
    }, [value]);

    useEffect(() => {
        const keyword = searchKeyword.trim();

        if (!isOpen || keyword === "") {
            setMoveList([]);
            return;
        }

        const timerId = window.setTimeout(async () => {
            setIsLoading(true);

            try {
                const data = await fetchMoveList(keyword, 20);
                setMoveList(data);
            } catch (error) {
                console.error(error);
                setMoveList([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [searchKeyword, isOpen]);

    const handleChange = (nextValue: string) => {
        setSearchKeyword(nextValue);
        setIsOpen(true);

        if (nextValue === "") {
            onSelect(null);
        }
    };

    const handleSelect = (move: MoveMaster) => {
        setSearchKeyword(move.name);
        setIsOpen(false);
        onSelect(move);
    };

    return (
        <div className="relative">
            <input
                className="w-full rounded border p-3"
                value={searchKeyword}
                onChange={(event) => handleChange(event.target.value)}
                onFocus={() => {
                    if (searchKeyword.trim() !== "") {
                        setIsOpen(true);
                    }
                }}
                placeholder="技名を検索"
            />

            {selectedMoveType && (
                <p className="mt-1 text-xs text-gray-500">
                    タイプ：{selectedMoveType}
                </p>
            )}

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
