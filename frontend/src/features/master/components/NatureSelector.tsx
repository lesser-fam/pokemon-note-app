"use client";

import { fetchNatureList } from "@/features/master/api/masterApi";
import type { NatureMaster } from "@/types/battleMaster";
import { useEffect, useState } from "react";

type NatureSelectorProps = {
    value: string;
    onChangeText: (value: string) => void;
    onSelect: (nature: NatureMaster) => void;
};

const statLabelMap: Record<string, string> = {
    a: "攻撃",
    b: "防御",
    c: "特攻",
    d: "特防",
    s: "素早さ",
};

export function NatureSelector({
    value,
    onChangeText,
    onSelect,
}: NatureSelectorProps) {
    const [natureList, setNatureList] = useState<NatureMaster[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const keyword = value.trim();

        if (!isOpen) {
            return;
        }

        let isCancelled = false;

        const timerId = window.setTimeout(async () => {
            setIsLoading(true);

            try {
                const data = await fetchNatureList(keyword, 25);

                if (!isCancelled) {
                    setNatureList(data);
                }
            } catch (error) {
                console.error(error);

                if (!isCancelled) {
                    setNatureList([]);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }, 200);

        return () => {
            isCancelled = true;
            window.clearTimeout(timerId);
        };
    }, [value, isOpen]);

    const handleChange = (nextValue: string) => {
        onChangeText(nextValue);
        setIsOpen(true);
    };

    const handleSelect = (nature: NatureMaster) => {
        setIsOpen(false);
        setNatureList([]);
        onSelect(nature);
    };

    return (
        <div className="relative">
            <input
                className="w-full rounded border p-3"
                value={value}
                onChange={(event) => handleChange(event.target.value)}
                onFocus={() => setIsOpen(true)}
                placeholder="性格名を検索"
            />

            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded border bg-white shadow-lg">
                    {isLoading ? (
                        <p className="p-3 text-sm text-gray-600">検索中...</p>
                    ) : natureList.length > 0 ? (
                        natureList.map((nature) => (
                            <button
                                key={nature.id}
                                type="button"
                                onClick={() => handleSelect(nature)}
                                className="block w-full border-b px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                                <span className="font-medium">
                                    {nature.name}
                                </span>

                                {nature.increased_stat &&
                                nature.decreased_stat ? (
                                    <span className="ml-3 text-xs">
                                        <span className="text-red-600">
                                            {
                                                statLabelMap[
                                                    nature.increased_stat
                                                ]
                                            }
                                            ↑
                                        </span>

                                        <span className="mx-1 text-gray-400">
                                            /
                                        </span>

                                        <span className="text-blue-600">
                                            {
                                                statLabelMap[
                                                    nature.decreased_stat
                                                ]
                                            }
                                            ↓
                                        </span>
                                    </span>
                                ) : (
                                    <span className="ml-3 text-xs text-gray-500">
                                        補正なし
                                    </span>
                                )}
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
