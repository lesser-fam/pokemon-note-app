"use client";

import {
    fetchAbilityList,
    fetchItemList,
} from "@/features/master/api/masterApi";
import { useEffect, useState } from "react";

type BattleMasterResource = "ability" | "item";

type BattleMasterOption = {
    id: number;
    key: string;
    name: string;
    description?: string | null;
};

type BattleMasterTextSelectorProps = {
    resource: BattleMasterResource;
    value: string;
    onChangeText: (value: string) => void;
    onSelect: (option: BattleMasterOption) => void;
    placeholder: string;
};

export function BattleMasterTextSelector({
    resource,
    value,
    onChangeText,
    onSelect,
    placeholder,
}: BattleMasterTextSelectorProps) {
    const [optionList, setOptionList] = useState<BattleMasterOption[]>([]);
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
                const data =
                    resource === "ability"
                        ? await fetchAbilityList(keyword, 20)
                        : await fetchItemList(keyword, 20);

                if (!isCancelled) {
                    setOptionList(data);
                }
            } catch (error) {
                console.error(error);

                if (!isCancelled) {
                    setOptionList([]);
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
    }, [resource, value, isOpen]);

    const handleChange = (nextValue: string) => {
        onChangeText(nextValue);

        if (nextValue.trim() === "") {
            setIsOpen(false);
            setOptionList([]);
            return;
        }

        setIsOpen(true);
    };

    const handleSelect = (option: BattleMasterOption) => {
        setIsOpen(false);
        setOptionList([]);
        onSelect(option);
    };

    return (
        <div className="relative">
            <input
                className="w-full rounded border p-3"
                value={value}
                onChange={(event) => handleChange(event.target.value)}
                onFocus={() => {
                    if (value.trim() !== "") {
                        setIsOpen(true);
                    }
                }}
                placeholder={placeholder}
            />

            {isOpen && (
                <div className="absolute z-20 mt-1 max-h-64 w-full overflow-x-hidden overflow-y-auto rounded border bg-white shadow-lg">
                    {isLoading ? (
                        <p className="p-3 text-sm text-gray-600">検索中...</p>
                    ) : optionList.length > 0 ? (
                        optionList.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className="group block w-full border-b px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                                <span className="flex items-center justify-between gap-2">
                                    <span>{option.name}</span>

                                    {resource === "item" && (
                                        <span className="ml-2 text-[10px] text-gray-400">
                                            説明を見る
                                        </span>
                                    )}
                                </span>

                                {resource === "item" && (
                                    <span className="mt-2 hidden rounded bg-gray-900 p-2 text-[11px] leading-relaxed text-white group-hover:block group-focus:block">
                                        <span className="block font-semibold">
                                            {option.name}
                                        </span>

                                        <span className="mt-1 block">
                                            {option.description ||
                                                "説明文は未登録です。"}
                                        </span>
                                    </span>
                                )}
                            </button>
                        ))
                    ) : (
                        <p className="p-3 text-sm text-gray-600">
                            候補が見つかりません。候補にない内容も手入力で保存できます。
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
