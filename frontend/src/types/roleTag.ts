export type RoleTag = {
    id: number;
    key: string;
    name: string;
    description: string;
    examples: string[] | null;
    lead_score: number;
    switch_score: number;
    finisher_score: number;
};
