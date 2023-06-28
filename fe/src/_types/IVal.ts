export type INodeBase = {};

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

export type IMap = {
    type: "map";
    children: IEntry[];
};
export type IEntry = {
    key: IVal;
    value: IVal;
};

export type IConstr = {
    type: "constr";
    name: string;
    children: IVal[];
    namedChildren: {name: string; value: IVal}[];
};
export type INode = {
    type: "node";
    name: string;
    children: IVal[];
    namedChildren: {name: string; value: IVal}[];
};
export type IList = {
    type: "list";
    children: IVal[];
};
export type ISet = {
    type: "set";
    children: IVal[];
};
export type ITuple = {
    type: "tuple";
    children: IVal[];
};

export type IString = {
    type: "string";
    value: (string | {type: "escaped"; text: string})[];
};
export type INum = {
    type: "number";
    value: string;
};
export type IBool = {
    type: "boolean";
    value: boolean;
};
export type ILoc = {
    type: "location";
    uri: string;
    position?: {
        offset: {start: number; end: number};
        start: {line: number; column: number};
        end: {line: number; column: number};
    };
};
