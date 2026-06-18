import { getPartyRuleConfig } from "./partyRuleConfig";
import type { PartyRule } from "@/types/party";

type PartyRuleBadgeProps = {
    rule: PartyRule;
};

export function PartyRuleBadge({ rule }: PartyRuleBadgeProps) {
    const config = getPartyRuleConfig(rule);

    return (
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
            {config.label}
        </span>
    );
}
