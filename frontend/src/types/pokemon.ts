export type Pokemon = {
    key: string;
    form_key: string;
    name: string;
    kana: string;
    types: string[];
    base_stats: {
        h: number;
        a: number;
        b: number;
        c: number;
        d: number;
        s: number;
    };
    image_url: string | null;
};
