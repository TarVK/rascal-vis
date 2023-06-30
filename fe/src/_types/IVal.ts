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

// Constructor/node
export type IConstrPlain = {
    type: "constr";
    name: string;
    children: IValPlain[];
    namedChildren: {name: string; value: IValPlain}[];
};
export type IConstr = {
    type: "constr";
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
export type INode = {
    type: "node";
    id: number;
    name: string;
    children: IVal[];
    namedChildren: {name: string; value: IVal}[];
};

// Other collections
export type IListPlain = {
    type: "list";
    children: IValPlain[];
};
export type IList = {
    type: "list";
    id: number;
    children: IVal[];
};
export type ISetPlain = {
    type: "set";
    children: IValPlain[];
};
export type ISet = {
    type: "set";
    id: number;
    children: IVal[];
};
export type ITuplePlain = {
    type: "tuple";
    children: IValPlain[];
};
export type ITuple = {
    type: "tuple";
    id: number;
    children: IVal[];
};

// Base values
export type IStringPlain = {
    type: "string";
    value: (string | {type: "escaped"; text: string})[];
};
export type IString = {
    type: "string";
    id: number;
    value: (string | {type: "escaped"; text: string})[];
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
