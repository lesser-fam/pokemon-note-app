import type { PokemonCommonMove } from "@/types/pokemonCommonMove";

export type CommonMoveAttackTypeMap = Map<string, string[]>;

const createPokemonFormKey = (pokemonKey: string, formKey: string): string =>
    `${pokemonKey}:${formKey}`;

export const createCommonMoveAttackTypeMap = (
    pokemonCommonMoves: PokemonCommonMove[],
): CommonMoveAttackTypeMap => {
    const attackTypeMap: CommonMoveAttackTypeMap = new Map();

    pokemonCommonMoves
        .filter(
            (commonMove) => commonMove.move_master.damage_class !== "status",
        )
        .forEach((commonMove) => {
            const mapKey = createPokemonFormKey(
                commonMove.pokemon_key,
                commonMove.form_key,
            );

            const currentTypes = attackTypeMap.get(mapKey) ?? [];
            const moveType = commonMove.move_master.type;

            if (!currentTypes.includes(moveType)) {
                attackTypeMap.set(mapKey, [...currentTypes, moveType]);
            }
        });

    return attackTypeMap;
};

export const findCommonMoveAttackTypes = ({
    attackTypeMap,
    pokemonKey,
    formKey,
}: {
    attackTypeMap: CommonMoveAttackTypeMap;
    pokemonKey: string;
    formKey: string;
}): string[] => {
    return attackTypeMap.get(createPokemonFormKey(pokemonKey, formKey)) ?? [];
};