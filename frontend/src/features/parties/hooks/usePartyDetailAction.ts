import { deleteBattleLog } from "@/features/battleLogs/api/battleLogApi";
import { deleteParty, fetchParty } from "@/features/parties/api/partyApi";
import { deletePartyPokemon } from "@/features/partyPokemon/api/partyPokemonApi";
import {
    createSelectionTemplate,
    deleteSelectionTemplate,
} from "@/features/selectionTemplates/api/selectionTemplateApi";
import { createSuggestedSelectionTemplatePayload } from "@/features/selectionTemplates/utils/createSuggestedSelectionTemplatePayload";
import type { Party, PartyPokemon } from "@/types/party";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

type SuggestedSelectionItem = {
    role: string;
    pokemon?: PartyPokemon | null;
};

type UsePartyDetailActionsParams = {
    party: Party | null;
    suggestedSelection: SuggestedSelectionItem[];
    partyPokemonLimit: number;
    setParty: Dispatch<SetStateAction<Party | null>>;
    setErrorMessage: Dispatch<SetStateAction<string>>;
};

export const usePartyDetailActions = ({
    party,
    suggestedSelection,
    partyPokemonLimit,
    setParty,
    setErrorMessage,
}: UsePartyDetailActionsParams) => {
    const router = useRouter();

    const [isSavingSelection, setIsSavingSelection] = useState(false);
    const [isDeletingParty, setIsDeletingParty] = useState(false);
    const [deletingPartyPokemonId, setDeletingPartyPokemonId] = useState<
        number | null
    >(null);
    const [deletingBattleLogId, setDeletingBattleLogId] = useState<
        number | null
    >(null);

    const refreshParty = async () => {
        if (!party) {
            return;
        }

        const refreshedParty = await fetchParty(party.id);
        setParty(refreshedParty);
    };

    const handleDeleteParty = async () => {
        if (!party) {
            return;
        }

        const confirmed = window.confirm(
            "このパーティを削除します。登録ポケモン、基本選出、対戦ログ、バージョン履歴も確認できなくなります。よろしいですか？",
        );

        if (!confirmed) {
            return;
        }

        setIsDeletingParty(true);
        setErrorMessage("");

        try {
            await deleteParty(party.id);

            router.replace("/parties");
        } catch (error) {
            console.error(error);
            setErrorMessage("パーティの削除に失敗しました。");
            setIsDeletingParty(false);
        }
    };

    const handleRemoveInitialPokemon = async (partyPokemonId: number) => {
        if (!party) {
            return;
        }

        const confirmed = window.confirm(
            "このポケモンをパーティから外します。よろしいですか？",
        );

        if (!confirmed) {
            return;
        }

        setDeletingPartyPokemonId(partyPokemonId);
        setErrorMessage("");

        try {
            await deletePartyPokemon(partyPokemonId);

            await refreshParty();
        } catch (error) {
            console.error(error);
            setErrorMessage(
                `ポケモンを外せませんでした。${partyPokemonLimit}匹そろった後の変更は、新バージョン作成から行ってください。`,
            );
        } finally {
            setDeletingPartyPokemonId(null);
        }
    };

    const handleSaveSuggestedSelection = async () => {
        if (!party?.current_version) {
            setErrorMessage("現在のバージョンが見つかりません。");
            return;
        }

        const suggestedSelectionPayload =
            createSuggestedSelectionTemplatePayload(suggestedSelection);

        if (!suggestedSelectionPayload.isValid) {
            setErrorMessage("保存できる基本選出がありません。");
            return;
        }

        setIsSavingSelection(true);
        setErrorMessage("");

        try {
            await createSelectionTemplate(
                party.current_version.id,
                suggestedSelectionPayload.payload,
            );

            await refreshParty();
        } catch (error) {
            console.error(error);
            setErrorMessage("基本選出の保存に失敗しました。");
        } finally {
            setIsSavingSelection(false);
        }
    };

    const handleDeleteSelectionTemplate = async (
        selectionTemplateId: number,
    ) => {
        const confirmed = window.confirm(
            "この基本選出を削除します。よろしいですか？",
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteSelectionTemplate(selectionTemplateId);

            await refreshParty();
        } catch (error) {
            console.error(error);
            setErrorMessage("基本選出の削除に失敗しました。");
        }
    };

    const handleDeleteBattleLog = async (battleLogId: number) => {
        const confirmed = window.confirm(
            "この対戦ログを削除します。よろしいですか？",
        );

        if (!confirmed) {
            return;
        }

        setDeletingBattleLogId(battleLogId);
        setErrorMessage("");

        try {
            await deleteBattleLog(battleLogId);

            await refreshParty();
        } catch (error) {
            console.error(error);
            setErrorMessage("対戦ログの削除に失敗しました。");
        } finally {
            setDeletingBattleLogId(null);
        }
    };

    return {
        isSavingSelection,
        isDeletingParty,
        deletingPartyPokemonId,
        deletingBattleLogId,
        handleDeleteParty,
        handleRemoveInitialPokemon,
        handleSaveSuggestedSelection,
        handleDeleteSelectionTemplate,
        handleDeleteBattleLog,
    };
};
