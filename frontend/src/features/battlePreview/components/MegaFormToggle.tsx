import {
    findDefaultForm,
    findMegaForms,
    isMegaForm,
} from "@/features/battlePreview/utils/megaEvolution";
import type { Pokemon } from "@/types/pokemon";

type MegaFormToggleProps = {
    pokemon: Pokemon;
    pokemonList: Pokemon[];
    onChange: (pokemon: Pokemon) => void;
};

const getMegaLabel = (formKey: string, megaFormCount: number): string => {
    if (megaFormCount === 1) {
        return "メガ";
    }

    if (formKey === "mega-x") {
        return "メガX";
    }

    if (formKey === "mega-y") {
        return "メガY";
    }

    return "メガ";
};

export function MegaFormToggle({
    pokemon,
    pokemonList,
    onChange,
}: MegaFormToggleProps) {
    const defaultForm = findDefaultForm(pokemonList, pokemon.key);

    const megaForms = findMegaForms(pokemonList, pokemon.key);

    if (!defaultForm || megaForms.length === 0) {
        return null;
    }

    const isMega = isMegaForm(pokemon);

    return (
        <div className="flex flex-wrap justify-end gap-1">
            <button
                type="button"
                onClick={() => onChange(defaultForm)}
                className={`rounded border px-1.5 py-0.5 text-[10px] ${
                    !isMega
                        ? "border-black bg-black text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
                通常
            </button>

            {megaForms.map((megaForm) => (
                <button
                    key={megaForm.form_key}
                    type="button"
                    onClick={() => onChange(megaForm)}
                    className={`rounded border px-1.5 py-0.5 text-[10px] ${
                        pokemon.form_key === megaForm.form_key
                            ? "border-black bg-black text-white"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                    {getMegaLabel(megaForm.form_key, megaForms.length)}
                </button>
            ))}
        </div>
    );
}
