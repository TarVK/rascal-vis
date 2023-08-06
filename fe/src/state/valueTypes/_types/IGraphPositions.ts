import {IVal} from "../../../_types/IVal";

export type IGraphNodePositions = IGraphNodePosition[];
export type IGraphNodePosition = {
    id: IVal;
    position: {x: number; y: number};
};

export type IGraphEdgePositions = IGraphEdgePosition[];
export type IGraphEdgePosition = {
    from: IVal;
    to: IVal;
    text?: string;
    bends: {x: number; y: number}[];
};
