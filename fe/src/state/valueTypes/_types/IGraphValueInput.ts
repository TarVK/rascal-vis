import {IBool, IConstr, ISet, IString, IVal} from "../../../_types/IVal";
import {graphConstrData, graphNodeConstrData} from "../GraphValueState";

// prettier-ignore
export type IGraphValueInput = Omit<IConstr, "namedChildren"|"children"> & {
    name: typeof graphConstrData["name"];
    children: [
        Omit<ISet, "children"> & {children: IGraphNodeValueInput[]},
        Omit<ISet, "children"> & {children: IGraphEdgeValueInput[]},
    ],
    namedChildren: (
        /** Whether the graph should be undirected */
        | {name: "undirected"; value: IBool}
        | IMeta
    )[];
};

// prettier-ignore
export type IGraphNodeValueInput = Omit<IConstr, "namedChildren" | "children"> & {
    name: (typeof graphNodeConstrData)["name"];
    children: [IVal];
    namedChildren: (
        /** The display name for the node */
        | {name: "name"; value: IString}
        /** The color to use for the node */
        | {name: "color"; value: IString}
        /** The color to use for highlighting/hovering over the node */
        | {name: "highlightColor"; value: IString}
        | IMeta
    )[];
};

// prettier-ignore
export type IGraphEdgeValueInput = Omit<IConstr, "namedChildren" | "children"> & {
    name: (typeof graphNodeConstrData)["name"];
    children: [
        IVal,
        IVal
    ];
    namedChildren: (
        /** The display name for the edge */
        | {name: "name"; value: IString}
        /** The color to use for the edge */
        | {name: "color"; value: IString}
        /** The color to use for highlighting/hovering over the edge */
        | {name: "highlightColor"; value: IString}
        /** Whether this specific edge should be undirected */
        | {name: "undirected"; value: IBool}
        | IMeta
    )[];
};

type IMeta =
    /** The source of this graph */
    | {name: "source"; value: IVal}
    /** Any metadata you might like */
    | {name: "meta"; value: IVal};
