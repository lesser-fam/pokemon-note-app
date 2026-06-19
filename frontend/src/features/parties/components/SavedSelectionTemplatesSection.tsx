import type { PartyPokemon, SelectionTemplate } from "@/types/party";
import Link from "next/link";
import type { ReactNode } from "react";

type SavedSelectionTemplatesSectionProps = {
    partyId: number;
    selectionTemplates: SelectionTemplate[];
    onDeleteSelectionTemplate: (selectionTemplateId: number) => void;
    renderSelectionPokemon: (
        label: string,
        partyPokemon?: PartyPokemon | null,
    ) => ReactNode;
};

export const SavedSelectionTemplatesSection = ({
    partyId,
    selectionTemplates,
    onDeleteSelectionTemplate,
    renderSelectionPokemon,
}: SavedSelectionTemplatesSectionProps) => {
    return (
        <div className="rounded border bg-white p-5">
            <h2 className="text-lg font-bold">保存済み基本選出</h2>

            <p className="mt-1 text-xs text-gray-600">
                対戦前の選出候補として使う基本選出です。
            </p>

            {selectionTemplates.length > 0 ? (
                <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
                    {selectionTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="rounded bg-gray-50 p-3"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate font-bold">
                                        {template.name}
                                    </p>

                                    {template.memo && (
                                        <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                                            {template.memo}
                                        </p>
                                    )}
                                </div>

                                <div className="flex shrink-0 gap-2">
                                    <Link
                                        href={`/parties/${partyId}/selection-templates/${template.id}/edit`}
                                        className="rounded border bg-white px-2 py-1 text-xs hover:bg-gray-50"
                                    >
                                        編集
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDeleteSelectionTemplate(
                                                template.id,
                                            )
                                        }
                                        className="rounded border border-red-300 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                    >
                                        削除
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                {renderSelectionPokemon(
                                    "初手",
                                    template.lead_pokemon,
                                )}

                                {renderSelectionPokemon(
                                    "引き先",
                                    template.switch_pokemon,
                                )}

                                {renderSelectionPokemon(
                                    "勝ち筋",
                                    template.finisher_pokemon,
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-600">
                    まだ基本選出は保存されていません。
                </p>
            )}
        </div>
    );
};
