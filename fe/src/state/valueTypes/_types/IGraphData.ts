import {IVal} from "../../../_types/IVal";
import {IValNode} from "../../../_types/IValNode";

export type IGraphData = {
    undirected?: boolean;
    nodes: IGraphNodeData[];
    edges: IGraphEdgeData[];
} & IMeta;

export type IGraphNodeData = {
    id: IVal;
    nodeSource: IValNode;
    name?: string;
    color?: string;
    highlightColor?: string;
} & IMeta;

export type IGraphEdgeData = {
    id: IVal;
    nodeSource: IValNode;
    start: IVal;
    end: IVal;
    undirected?: boolean;
    name?: string;
    color?: string;
    highlightColor?: string;
} & IMeta;

type IMeta = {
    source?: IVal;
    meta?: IVal;
};
