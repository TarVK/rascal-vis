export type IValPlain =
    | IMapPlain
    | ITuplePlain
    | IConstrPlain
    | INodePlain
    | IListPlain
    | ISetPlain
    | IStringPlain
    | INumPlain
    | IBoolPlain
    | ILocPlain;

export type IVal =
    | IMap
    | ITuple
    | IConstr
    | INode
    | IList
    | ISet
    | IString
    | INum
    | IBool
    | ILoc;

export type IValPlainPattern =
    | IMapPlainPattern
    | ITuplePlainPattern
    | IConstrPlainPattern
    | INodePlainPattern
    | IListPlainPattern
    | ISetPlainPattern
    | IStringPlain
    | INumPlain
    | IBoolPlain
    | ILocPlain
    | IAny
    | IRepeat
    | ITextPattern
    | IRegex
    | IOr;

// Map
export type IMapPlain = {
    type: "map";
    children: IEntryPlain[];
};
export type IEntryPlain = {
    key: IValPlain;
    value: IValPlain;
};
export type IMap = {
    type: "map";
    id: number;
    children: IEntry[];
};
export type IEntry = {
    id: number;
    key: IVal;
    value: IVal;
};
export type IMapPlainPattern = {
    type: "map";
    children: IEntryPlainPattern[];
};
export type IEntryPlainPattern = {
    key: IValPlainPattern;
    value: IValPlainPattern;
};

// Constructor/node
export type IConstr = {
    type: "constr";
    id: number;
    name: string;
    children: IVal[];
    namedChildren: {name: string; value: IVal}[];
};
export type IConstrPlain = {
    type: "constr";
    name: string;
    children: IValPlain[];
    namedChildren: {name: string; value: IValPlain}[];
};
export type IConstrPlainPattern = {
    type: "constr";
    name: string | IRegex | ITextPattern;
    children: IValPlainPattern[];
    namedChildren: {name: string | IRegex | ITextPattern; value: IValPlainPattern}[];
};
export type INode = {
    type: "node";
    id: number;
    name: string;
    children: IVal[];
    namedChildren: {name: string; value: IVal}[];
};
export type INodePlain = {
    type: "node";
    name: string;
    children: IValPlain[];
    namedChildren: {name: string; value: IValPlain}[];
};
export type INodePlainPattern = {
    type: "node";
    name: string;
    children: IValPlainPattern[];
    namedChildren: {name: string; value: IValPlainPattern}[];
};

// Other collections
export type IList = {
    type: "list";
    id: number;
    children: IVal[];
};
export type IListPlain = {
    type: "list";
    children: IValPlain[];
};
export type IListPlainPattern = {
    type: "list";
    children: IValPlainPattern[];
};
export type ISet = {
    type: "set";
    id: number;
    children: IVal[];
};
export type ISetPlain = {
    type: "set";
    children: IValPlain[];
};
export type ISetPlainPattern = {
    type: "set";
    children: IValPlainPattern[];
};
export type ITuple = {
    type: "tuple";
    id: number;
    children: IVal[];
};
export type ITuplePlain = {
    type: "tuple";
    children: IValPlain[];
};
export type ITuplePlainPattern = {
    type: "tuple";
    children: IValPlainPattern[];
};

// Base values
export type IStringPlain = {
    type: "string";
    value: (string | {type: "escaped"; text: string})[];
    valuePlain: string;
};
export type IString = {
    type: "string";
    id: number;
    value: (string | {type: "escaped"; text: string})[];
    valuePlain: string;
};
export type INumPlain = {
    type: "number";
    value: string;
};
export type INum = {
    type: "number";
    id: number;
    value: string;
};
export type IBoolPlain = {
    type: "boolean";
    value: boolean;
};
export type IBool = {
    type: "boolean";
    id: number;
    value: boolean;
};
export type ILocPlain = {
    type: "location";
    uri: string;
    position?: {
        offset: {start: number; end: number};
        start: {line: number; column: number};
        end: {line: number; column: number};
    };
};
export type ILoc = {
    type: "location";
    id: number;
    uri: string;
    position?: {
        offset: {start: number; end: number};
        start: {line: number; column: number};
        end: {line: number; column: number};
    };
};

// Patterns
export type IAny = {type: "any"};
export type IRepeat = {type: "repeat"; value: IValPlainPattern};

export type IRegex = {type: "regex"; regex: RegExp};
export type ITextPattern = {
    type: "textPattern";
    value: (string | {type: "escaped"; text: string})[];
    valuePlain: string;
};
export type IOr = {type: "or"; options: [IValPlainPattern, ...IValPlainPattern[]]};
