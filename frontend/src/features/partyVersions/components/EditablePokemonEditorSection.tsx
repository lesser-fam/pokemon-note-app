import { PokemonBuildEditor } from "@/features/partyPokemon/components/PokemonBuildEditor";
import {
    effortValueFieldMap,
    moveFieldMap,
} from "@/features/partyVersions/constants/editablePokemonFields";
import type { EditablePokemon } from "@/features/partyVersions/types/editablePokemon";
import type { NatureMaster } from "@/types/battleMaster";
import type { Pokemon } from "@/types/pokemon";
import type { RoleTag } from "@/types/roleTag";
import type { RefObject } from "react";

type EditablePokemonEditorSectionProps = {
    sectionRef: RefObject<HTMLDivElement | null>;
    editingPokemon: EditablePokemon;
    editingPokemonIndex: number;
    editingPokemonMaster: Pokemon | undefined;
    editingNatureMaster: NatureMaster | undefined;
    effortValueLimits: {
        totalLimit: number;
        singleLimit: number;
        label: string;
    };
    roleTags: RoleTag[];
    onClose: () => void;
    onUpdatePokemon: (
        index: number,
        field: keyof EditablePokemon,
        value: string | number | number[] | null,
    ) => void;
    onToggleRoleTag: (index: number, roleTagId: number) => void;
};

export const EditablePokemonEditorSection = ({
    sectionRef,
    editingPokemon,
    editingPokemonIndex,
    editingPokemonMaster,
    editingNatureMaster,
    effortValueLimits,
    roleTags,
    onClose,
    onUpdatePokemon,
    onToggleRoleTag,
}: EditablePokemonEditorSectionProps) => {
    return (
        <div
            ref={sectionRef}
            className="mt-5 w-full min-w-0 scroll-mt-4 rounded border bg-gray-50 p-5"
        >
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold">
                        {editingPokemonMaster?.name ||
                            editingPokemon.pokemon_key}
                        の型・技情報
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        登録済みの内容を編集できます。
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="text-sm text-blue-600"
                >
                    編集欄を閉じる
                </button>
            </div>

            <div className="mt-4">
                <PokemonBuildEditor
                    pokemonKey={editingPokemon.pokemon_key}
                    formKey={editingPokemon.form_key}
                    nickname={editingPokemon.nickname}
                    onChangeNickname={(value) =>
                        onUpdatePokemon(editingPokemonIndex, "nickname", value)
                    }
                    abilityId={editingPokemon.ability_id}
                    onSelectAbility={(selectedAbility) => {
                        onUpdatePokemon(
                            editingPokemonIndex,
                            "ability",
                            selectedAbility.name,
                        );

                        onUpdatePokemon(
                            editingPokemonIndex,
                            "ability_id",
                            selectedAbility.id,
                        );
                    }}
                    item={editingPokemon.item}
                    onChangeItemText={(value) => {
                        onUpdatePokemon(editingPokemonIndex, "item", value);

                        onUpdatePokemon(editingPokemonIndex, "item_id", null);
                    }}
                    onSelectItem={(option) => {
                        onUpdatePokemon(
                            editingPokemonIndex,
                            "item",
                            option.name,
                        );

                        onUpdatePokemon(
                            editingPokemonIndex,
                            "item_id",
                            option.id,
                        );
                    }}
                    nature={editingPokemon.nature}
                    natureId={editingPokemon.nature_id}
                    natureMaster={editingNatureMaster}
                    onChangeNatureText={(value) => {
                        onUpdatePokemon(editingPokemonIndex, "nature", value);

                        onUpdatePokemon(editingPokemonIndex, "nature_id", null);
                    }}
                    onSelectNature={(option) => {
                        onUpdatePokemon(
                            editingPokemonIndex,
                            "nature",
                            option.name,
                        );

                        onUpdatePokemon(
                            editingPokemonIndex,
                            "nature_id",
                            option.id,
                        );
                    }}
                    effortValues={{
                        h: editingPokemon.ev_h,
                        a: editingPokemon.ev_a,
                        b: editingPokemon.ev_b,
                        c: editingPokemon.ev_c,
                        d: editingPokemon.ev_d,
                        s: editingPokemon.ev_s,
                    }}
                    effortValueLimits={effortValueLimits}
                    onChangeEffortValue={(statKey, value) => {
                        onUpdatePokemon(
                            editingPokemonIndex,
                            effortValueFieldMap[statKey],
                            Number(value || 0),
                        );
                    }}
                    moves={[
                        {
                            name: editingPokemon.move_1,
                            id: editingPokemon.move_1_id,
                            type: editingPokemon.move_1_type,
                        },
                        {
                            name: editingPokemon.move_2,
                            id: editingPokemon.move_2_id,
                            type: editingPokemon.move_2_type,
                        },
                        {
                            name: editingPokemon.move_3,
                            id: editingPokemon.move_3_id,
                            type: editingPokemon.move_3_type,
                        },
                        {
                            name: editingPokemon.move_4,
                            id: editingPokemon.move_4_id,
                            type: editingPokemon.move_4_type,
                        },
                    ]}
                    onChangeMove={(moveIndex, move) => {
                        const fields = moveFieldMap[moveIndex];

                        if (!fields) {
                            return;
                        }

                        onUpdatePokemon(
                            editingPokemonIndex,
                            fields.name,
                            move.name,
                        );

                        onUpdatePokemon(
                            editingPokemonIndex,
                            fields.id,
                            move.id,
                        );

                        onUpdatePokemon(
                            editingPokemonIndex,
                            fields.type,
                            move.type,
                        );
                    }}
                    memo={editingPokemon.memo}
                    onChangeMemo={(value) =>
                        onUpdatePokemon(editingPokemonIndex, "memo", value)
                    }
                    roleTags={roleTags}
                    selectedRoleTagIds={editingPokemon.role_tag_ids}
                    onToggleRoleTag={(roleTagId) =>
                        onToggleRoleTag(editingPokemonIndex, roleTagId)
                    }
                />
            </div>
        </div>
    );
};
