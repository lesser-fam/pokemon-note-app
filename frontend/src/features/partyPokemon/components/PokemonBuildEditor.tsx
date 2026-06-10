import type { NatureMaster } from "@/types/battleMaster";
import type { RoleTag } from "@/types/roleTag";
import {
    EffortValueEditor,
    type EffortValueStatKey,
} from "@/features/partyPokemon/components/EffortValueEditor";
import {
    MoveListEditor,
    type EditableMove,
} from "@/features/partyPokemon/components/MoveListEditor";
import {
    PokemonBasicInfoEditor,
    type BattleMasterOption,
    type PokemonAbilityCandidate,
} from "@/features/partyPokemon/components/PokemonBasicInfoEditor";
import { RoleTagSelector } from "@/features/partyPokemon/components/RoleTagSelector";

type EffortValueLimits = {
    totalLimit: number;
    singleLimit: number;
    label: string;
};

type PokemonBuildEditorProps = {
    pokemonKey: string;
    formKey: string;

    nickname: string;
    onChangeNickname: (value: string) => void;

    abilityId: number | null;
    onSelectAbility: (ability: PokemonAbilityCandidate) => void;

    item: string;
    onChangeItemText: (value: string) => void;
    onSelectItem: (item: BattleMasterOption) => void;

    nature: string;
    natureId: number | null;
    natureMaster?: NatureMaster | null;
    onChangeNatureText: (value: string) => void;
    onSelectNature: (nature: NatureMaster) => void;

    effortValues: Record<EffortValueStatKey, string | number>;
    effortValueLimits: EffortValueLimits;
    onChangeEffortValue: (statKey: EffortValueStatKey, value: string) => void;

    moves: [EditableMove, EditableMove, EditableMove, EditableMove];
    onChangeMove: (moveIndex: number, move: EditableMove) => void;

    memo: string;
    onChangeMemo: (value: string) => void;

    roleTags: RoleTag[];
    selectedRoleTagIds: number[];
    onToggleRoleTag: (roleTagId: number) => void;
};

export function PokemonBuildEditor({
    pokemonKey,
    formKey,
    nickname,
    onChangeNickname,
    abilityId,
    onSelectAbility,
    item,
    onChangeItemText,
    onSelectItem,
    nature,
    natureId,
    natureMaster = null,
    onChangeNatureText,
    onSelectNature,
    effortValues,
    effortValueLimits,
    onChangeEffortValue,
    moves,
    onChangeMove,
    memo,
    onChangeMemo,
    roleTags,
    selectedRoleTagIds,
    onToggleRoleTag,
}: PokemonBuildEditorProps) {
    return (
        <div>
            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,17rem)_8rem_minmax(0,22rem)_minmax(0,1fr)]">
                <PokemonBasicInfoEditor
                    pokemonKey={pokemonKey}
                    formKey={formKey}
                    nickname={nickname}
                    onChangeNickname={onChangeNickname}
                    abilityId={abilityId}
                    onSelectAbility={onSelectAbility}
                    item={item}
                    onChangeItemText={onChangeItemText}
                    onSelectItem={onSelectItem}
                    nature={nature}
                    natureId={natureId}
                    onChangeNatureText={onChangeNatureText}
                    onSelectNature={onSelectNature}
                />

                <EffortValueEditor
                    values={effortValues}
                    limits={effortValueLimits}
                    nature={natureMaster}
                    onChange={onChangeEffortValue}
                />

                <MoveListEditor moves={moves} onChange={onChangeMove} />

                <div className="min-w-0">
                    <label className="block text-sm font-medium">メモ</label>

                    <textarea
                        className="mt-1 min-h-40 w-full rounded border p-3"
                        value={memo}
                        onChange={(event) => onChangeMemo(event.target.value)}
                        placeholder="型の意図、選出時の注意点など"
                    />
                </div>
            </div>

            <div className="mt-5 border-t pt-4">
                <RoleTagSelector
                    roleTags={roleTags}
                    selectedRoleTagIds={selectedRoleTagIds}
                    onToggle={onToggleRoleTag}
                />
            </div>
        </div>
    );
}
