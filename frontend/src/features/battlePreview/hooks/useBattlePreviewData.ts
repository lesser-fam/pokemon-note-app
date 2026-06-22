import { fetchPokemonList } from "@/features/master/api/masterApi";
import { fetchParty } from "@/features/parties/api/partyApi";
import type { Party } from "@/types/party";
import type { Pokemon } from "@/types/pokemon";
import { useEffect, useState } from "react";

type UseBattlePreviewDataParams = {
    partyId: number;
    isInvalidPartyId: boolean;
};

export const useBattlePreviewData = ({
    partyId,
    isInvalidPartyId,
}: UseBattlePreviewDataParams) => {
    const [party, setParty] = useState<Party | null>(null);
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [partyData, pokemonData] = await Promise.all([
                    fetchParty(partyId),
                    fetchPokemonList(),
                ]);

                setParty(partyData);
                setPokemonList(pokemonData);
            } catch (error) {
                console.error(error);
                setErrorMessage("必要なデータの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (isInvalidPartyId) {
            setIsLoading(false);
            return;
        }

        loadData();
    }, [partyId, isInvalidPartyId]);

    return {
        party,
        pokemonList,
        isLoading,
        errorMessage,
    };
};
