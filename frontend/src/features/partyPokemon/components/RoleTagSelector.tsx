import type { RoleTag } from "@/types/roleTag";
import { MAX_ROLE_TAG_COUNT } from "../constants/partyPokemonLimits";

type RoleTagSelectorProps = {
    roleTags: RoleTag[];
    selectedRoleTagIds: number[];
    onToggle: (roleTagId: number) => void;
    maxSelected?: number;
};

export function RoleTagSelector({
    roleTags,
    selectedRoleTagIds,
    onToggle,
    maxSelected = MAX_ROLE_TAG_COUNT,
}: RoleTagSelectorProps) {
    return (
        <div>
            <p className="text-sm font-medium">役割タグ</p>

            <p className="mt-1 text-xs text-gray-500">
                主な役割を{maxSelected}
                個まで選べます。タグにマウスを重ねると説明を確認できます。
            </p>

            <p className="mt-1 text-xs text-gray-500">
                タグを付けすぎると、おすすめ選出の点数が偏るため、重要な役割だけを選んでください。
            </p>

            <p className="mt-2 text-xs font-medium text-gray-600">
                選択中：
                {selectedRoleTagIds.length} / {maxSelected}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
                {roleTags.map((tag) => {
                    const isSelected = selectedRoleTagIds.includes(tag.id);

                    const isDisabled =
                        !isSelected && selectedRoleTagIds.length >= maxSelected;

                    return (
                        <div key={tag.id} className="group relative">
                            <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => onToggle(tag.id)}
                                className={`rounded-full border px-3 py-1 text-sm ${
                                    isSelected
                                        ? "border-black bg-black text-white"
                                        : isDisabled
                                          ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                          : "bg-white hover:bg-gray-50"
                                }`}
                            >
                                {tag.name}
                            </button>

                            <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-72 -translate-x-1/2 rounded bg-gray-900 p-3 text-left text-xs leading-relaxed text-white shadow-lg group-hover:block">
                                <p className="font-semibold">{tag.name}</p>

                                <p className="mt-1">{tag.description}</p>

                                {tag.examples && tag.examples.length > 0 && (
                                    <div className="mt-2">
                                        <p className="font-semibold">例</p>

                                        <ul className="mt-1 space-y-0.5">
                                            {tag.examples.map((example) => (
                                                <li key={example}>
                                                    ・{example}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
