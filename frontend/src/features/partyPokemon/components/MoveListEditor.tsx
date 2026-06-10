import { MoveSelector } from "@/features/master/components/MoveSelector";

export type EditableMove = {
    name: string;
    id: number | null;
    type: string;
};

type MoveListEditorProps = {
    moves: [EditableMove, EditableMove, EditableMove, EditableMove];
    onChange: (moveIndex: number, move: EditableMove) => void;
};

export function MoveListEditor({ moves, onChange }: MoveListEditorProps) {
    return (
        <div>
            <p className="text-xs text-gray-500">
                候補から技を選ぶと、攻撃技のタイプが自動設定されます。
                変化技は攻撃相性点に含まれません。
            </p>

            <div className="mt-3 space-y-3">
                {moves.map((move, moveIndex) => (
                    <div key={moveIndex}>
                        <div className="flex min-h-5 items-center gap-2">
                            <label className="text-sm font-medium">
                                技{moveIndex + 1}
                            </label>

                            {move.type && (
                                <span className="rounded-full border bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                                    {move.type}
                                </span>
                            )}
                        </div>

                        <div className="mt-1">
                            <MoveSelector
                                value={move.name}
                                onChangeText={(value) =>
                                    onChange(moveIndex, {
                                        name: value,
                                        id: null,
                                        type: "",
                                    })
                                }
                                onSelect={(selectedMove) =>
                                    onChange(moveIndex, {
                                        name: selectedMove.name,
                                        id: selectedMove.id,
                                        type: selectedMove.is_scoring_target
                                            ? selectedMove.type
                                            : "",
                                    })
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
