type Line = {
    type: string;
    name: string;
    args: string[];
};

export type Program = {
    name: string;
    args: string[];
    keywords: string[];
    body: Line[];
};
