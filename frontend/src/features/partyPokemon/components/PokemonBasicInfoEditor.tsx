import { BattleMasterTextSelector } from "@/features/master/components/BattleMasterTextSelector";
import { NatureSelector } from "@/features/master/components/NatureSelector";
import { PokemonAbilitySelector } from "@/features/master/components/PokemonAbilitySelector";
import type { NatureMaster } from "@/types/battleMaster";
import type { PokemonAbilityGroup } from "@/types/pokemonAbility";

export type PokemonAbilityCandidate =
    PokemonAbilityGroup["abilities"][number];

export type BattleMasterOption = {
    id: number;
    key: string;
    name: string;
};

type PokemonBasicInfoEditorProps = {
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
    onChangeNatureText: (value: string) => void;
    onSelectNature: (nature: NatureMaster) => void;
};

export function PokemonBasicInfoEditor({
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
    onChangeNatureText,
    onSelectNature,
}: PokemonBasicInfoEditorProps) {
    return (
        <div className="min-w-0 space-y-4">
            <div>
                <label className="block text-sm font-medium">
                    ニックネーム・表示名
                </label>

                <input
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={nickname}
                    onChange={(event) => onChangeNickname(event.target.value)}
                    placeholder="空欄ならポケモン名で表示"
                />
            </div>

            <div>
                <label className="block text-sm font-medium">特性</label>

                <div className="mt-2">
                    <PokemonAbilitySelector
                        pokemonKey={pokemonKey}
                        formKey={formKey}
                        selectedAbilityId={abilityId}
                        onSelect={onSelectAbility}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">持ち物</label>

                <div className="mt-1">
                    <BattleMasterTextSelector
                        resource="item"
                        value={item}
                        onChangeText={onChangeItemText}
                        onSelect={onSelectItem}
                        placeholder="持ち物名を検索"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">性格</label>

                <div className="mt-1">
                    <NatureSelector
                        value={nature}
                        selectedNatureId={natureId}
                        onChangeText={onChangeNatureText}
                        onSelect={onSelectNature}
                    />
                </div>
            </div>
        </div>
    );
}
