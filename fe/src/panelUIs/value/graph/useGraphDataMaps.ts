import {useMemo} from "react";
import {
    IGraphData,
    IGraphEdgeData,
    IGraphNodeData,
} from "../../../state/valueTypes/_types/IGraphData";
import {IGraphDataMap} from "./_types/IGraphDataMaps";

/**
 * Obtains a node and edge map for the given graph
 * @param graphData The graph data
 * @returns The maps
 */
export function useGraphDataMaps(graphData: IGraphData | null): IGraphDataMap {
    return useMemo(() => {
        const nodeMap: Record<string, IGraphNodeData> = {};
        const edgeMap: Record<string, IGraphEdgeData> = {};
        if (graphData) {
            for (let node of graphData.nodes) nodeMap[node.id.id] = node;
            for (let edge of graphData.edges) edgeMap[edge.id.id] = edge;
        }
        return {nodeMap, edgeMap};
    }, [graphData]);
}
