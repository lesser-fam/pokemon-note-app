import { PokemonBuildEditor } from "@/features/partyPokemon/components/PokemonBuildEditor";
import type { NatureMaster } from "@/types/battleMaster";
import type { RoleTag } from "@/types/roleTag";

type EffortValues = {
    h: string;
    a: string;
    b: string;
    c: string;
    d: string;
    s: string;
};

type EffortValueLimits = {
    totalLimit: number;
    singleLimit: number;
    label: string;
};

type EditableMove = {
    name: string;
    id: number | null;
    type: string;
};

type EditableMoves = [EditableMove, EditableMove, EditableMove, EditableMove];

type PartyPokemonBuildSectionProps = {
    pokemonKey: string;
    formKey: string;

    nickname: string;
    onChangeNickname: (value: string) => void;

    abilityId: number | null;
    onSelectAbility: (selectedAbility: { id: number; name: string }) => void;

    item: string;
    onChangeItemText: (value: string) => void;
    onSelectItem: (option: { id: number; name: string }) => void;

    nature: string;
    natureId: number | null;
    natureMaster: NatureMaster | null;
    onChangeNatureText: (value: string) => void;
    onSelectNature: (option: NatureMaster) => void;

    effortValues: EffortValues;
    effortValueLimits: EffortValueLimits;
    onChangeEffortValue: (
        statKey: "h" | "a" | "b" | "c" | "d" | "s",
        value: string,
    ) => void;

    moves: EditableMoves;
    onChangeMove: (
        moveIndex: number,
        move: {
            name: string;
            id: number | null;
            type: string;
        },
    ) => void;

    memo: string;
    onChangeMemo: (value: string) => void;

    roleTags: RoleTag[];
    selectedRoleTagIds: number[];
    onToggleRoleTag: (roleTagId: number) => void;
};

export const PartyPokemonBuildSection = ({
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
    natureMaster,
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
}: PartyPokemonBuildSectionProps) => {
    return (
        <section className="rounded border bg-white p-5">
            <h2 className="text-lg font-bold">型・技情報</h2>

            <div className="mt-4">
                <PokemonBuildEditor
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
                    natureMaster={natureMaster}
                    onChangeNatureText={onChangeNatureText}
                    onSelectNature={onSelectNature}
                    effortValues={effortValues}
                    effortValueLimits={effortValueLimits}
                    onChangeEffortValue={onChangeEffortValue}
                    moves={moves}
                    onChangeMove={onChangeMove}
                    memo={memo}
                    onChangeMemo={onChangeMemo}
                    roleTags={roleTags}
                    selectedRoleTagIds={selectedRoleTagIds}
                    onToggleRoleTag={onToggleRoleTag}
                />
            </div>
        </section>
    );
};
