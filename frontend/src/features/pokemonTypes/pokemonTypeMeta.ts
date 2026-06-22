export type PokemonTypeMeta = {
    label: string;
    className: string;
};

export const pokemonTypeMeta: Record<string, PokemonTypeMeta> = {
    ノーマル: {
        label: "ノーマル",
        className: "border-gray-300 bg-gray-100 text-gray-700",
    },
    ほのお: {
        label: "ほのお",
        className: "border-red-300 bg-red-100 text-red-700",
    },
    みず: {
        label: "みず",
        className: "border-blue-300 bg-blue-100 text-blue-700",
    },
    でんき: {
        label: "でんき",
        className: "border-yellow-300 bg-yellow-100 text-yellow-800",
    },
    くさ: {
        label: "くさ",
        className: "border-green-300 bg-green-100 text-green-700",
    },
    こおり: {
        label: "こおり",
        className: "border-cyan-300 bg-cyan-100 text-cyan-700",
    },
    かくとう: {
        label: "かくとう",
        className: "border-orange-300 bg-orange-100 text-orange-800",
    },
    どく: {
        label: "どく",
        className: "border-purple-300 bg-purple-100 text-purple-700",
    },
    じめん: {
        label: "じめん",
        className: "border-amber-300 bg-amber-100 text-amber-800",
    },
    ひこう: {
        label: "ひこう",
        className: "border-sky-300 bg-sky-100 text-sky-700",
    },
    エスパー: {
        label: "エスパー",
        className: "border-pink-300 bg-pink-100 text-pink-700",
    },
    むし: {
        label: "むし",
        className: "border-lime-300 bg-lime-100 text-lime-700",
    },
    いわ: {
        label: "いわ",
        className: "border-stone-300 bg-stone-100 text-stone-700",
    },
    ゴースト: {
        label: "ゴースト",
        className: "border-violet-300 bg-violet-100 text-violet-700",
    },
    ドラゴン: {
        label: "ドラゴン",
        className: "border-indigo-300 bg-indigo-100 text-indigo-700",
    },
    あく: {
        label: "あく",
        className: "border-neutral-400 bg-neutral-800 text-white",
    },
    はがね: {
        label: "はがね",
        className: "border-slate-300 bg-slate-100 text-slate-700",
    },
    フェアリー: {
        label: "フェアリー",
        className: "border-rose-300 bg-rose-100 text-rose-700",
    },
};

export const getPokemonTypeMeta = (type: string): PokemonTypeMeta => {
    return (
        pokemonTypeMeta[type] ?? {
            label: type,
            className: "border-gray-300 bg-gray-100 text-gray-700",
        }
    );
};
