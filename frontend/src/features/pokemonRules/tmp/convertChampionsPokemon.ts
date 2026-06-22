import type { Pokemon } from "@/types/pokemon";

const championsNationalDexNumbers = [
    3, 6, 9, 15, 18, 24, 25, 26, 36, 38, 59, 65, 68, 71, 80, 94, 115, 121, 127,
    128, 130, 132, 134, 135, 136, 142, 143, 149, 154, 157, 160, 168, 181, 184,
    186, 196, 197, 199, 205, 208, 212, 214, 227, 229, 248, 279, 282, 302, 306,
    308, 310, 319, 323, 324, 334, 350, 351, 354, 358, 359, 362, 389, 392, 395,
    405, 407, 409, 411, 428, 442, 445, 448, 450, 454, 460, 461, 464, 470, 471,
    472, 473, 475, 478, 479, 497, 500, 503, 505, 510, 512, 514, 516, 530, 531,
    534, 547, 553, 563, 569, 571, 579, 584, 587, 609, 614, 618, 623, 635, 637,
    652, 655, 658, 660, 663, 666, 670, 671, 675, 676, 678, 681, 683, 685, 693,
    695, 697, 699, 700, 701, 702, 706, 707, 709, 711, 713, 715, 724, 727, 730,
    733, 740, 745, 748, 750, 752, 758, 763, 765, 766, 778, 780, 784, 823, 841,
    842, 844, 855, 858, 866, 867, 869, 877, 887, 899, 900, 902, 903, 908, 911,
    914, 925, 934, 936, 937, 939, 952, 956, 959, 964, 968, 970, 981, 983, 1013,
    1018, 1019, 26, 45, 211, 254, 257, 260, 303, 376, 398, 518, 545, 560, 604,
    668, 687, 689, 691, 861, 870, 904, 972, 979, 1000,
];

const shouldExcludeFromSearch = (pokemon: Pokemon): boolean => {
    return pokemon.form_key.startsWith("mega");
};

export const convertChampionsDexNumbersToIdentifiers = (
    pokemonList: Pokemon[],
) => {
    const numberSet = new Set(championsNationalDexNumbers);

    const matchedPokemon = pokemonList.filter((pokemon) => {
        if (!numberSet.has(pokemon.national_dex_number)) {
            return false;
        }

        if (shouldExcludeFromSearch(pokemon)) {
            return false;
        }

        return true;
    });

    const matched = matchedPokemon.map(
        (pokemon) => `${pokemon.key}:${pokemon.form_key}`,
    );

    const matchedDexNumbers = new Set(
        matchedPokemon.map((pokemon) => pokemon.national_dex_number),
    );

    const missingDexNumbers = championsNationalDexNumbers.filter(
        (dexNumber) => !matchedDexNumbers.has(dexNumber),
    );

    return {
        matched: [...new Set(matched)].sort(),
        missingDexNumbers,
        sourceCount: championsNationalDexNumbers.length,
        matchedCount: [...new Set(matched)].length,
        missingCount: missingDexNumbers.length,
        matchedPokemon: matchedPokemon
            .map((pokemon) => ({
                dex: pokemon.national_dex_number,
                identifier: `${pokemon.key}:${pokemon.form_key}`,
                name: pokemon.name,
            }))
            .sort((a, b) => {
                if (a.dex !== b.dex) {
                    return a.dex - b.dex;
                }

                return a.identifier.localeCompare(b.identifier);
            }),
    };
};
