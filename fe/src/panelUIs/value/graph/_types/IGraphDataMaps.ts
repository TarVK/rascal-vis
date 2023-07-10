import {
    IGraphEdgeData,
    IGraphNodeData,
} from "../../../../state/valueTypes/_types/IGraphData";

export type IGraphDataMap = {
    nodeMap: Record<string, IGraphNodeData>;
    edgeMap: Record<string, IGraphEdgeData>;
};
