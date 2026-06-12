const pokemonTypeClassNameMap: Record<string, string> = {
    ノーマル: "bg-gray-100 text-gray-700",
    ほのお: "bg-red-100 text-red-700",
    みず: "bg-blue-100 text-blue-700",
    でんき: "bg-yellow-100 text-yellow-700",
    くさ: "bg-green-100 text-green-700",
    こおり: "bg-cyan-100 text-cyan-700",
    かくとう: "bg-orange-100 text-orange-700",
    どく: "bg-purple-100 text-purple-700",
    じめん: "bg-amber-100 text-amber-700",
    ひこう: "bg-sky-100 text-sky-700",
    エスパー: "bg-pink-100 text-pink-700",
    むし: "bg-lime-100 text-lime-700",
    いわ: "bg-stone-200 text-stone-700",
    ゴースト: "bg-violet-100 text-violet-700",
    ドラゴン: "bg-indigo-100 text-indigo-700",
    あく: "bg-gray-200 text-gray-800",
    はがね: "bg-slate-200 text-slate-700",
    フェアリー: "bg-rose-100 text-rose-700",
};

export const getPokemonTypeClassName = (type: string): string => {
    return pokemonTypeClassNameMap[type] ?? "bg-gray-100 text-gray-700";
};
