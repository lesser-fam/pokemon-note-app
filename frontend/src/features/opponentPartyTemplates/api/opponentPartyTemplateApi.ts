import { api } from "@/lib/api";
import type { OpponentPartyTemplate } from "@/types/opponentPartyTemplate";
import type { PartyRule } from "@/types/party";

type CreateOpponentPartyTemplateParams = {
    rule: PartyRule;
    memo?: string | null;
    pokemon: {
        pokemon_key: string;
        form_key: string;
    }[];
};

export const fetchOpponentPartyTemplates = async (): Promise<
    OpponentPartyTemplate[]
> => {
    const response = await api.get<{
        data: OpponentPartyTemplate[];
    }>("/api/opponent-party-templates");

    return response.data.data;
};

export const createOpponentPartyTemplate = async (
    params: CreateOpponentPartyTemplateParams,
): Promise<OpponentPartyTemplate> => {
    const response = await api.post<{
        data: OpponentPartyTemplate;
    }>("/api/opponent-party-templates", params);

    return response.data.data;
};

export const deleteOpponentPartyTemplate = async (
    templateId: number,
): Promise<void> => {
    await api.delete(`/api/opponent-party-templates/${templateId}`);
};
