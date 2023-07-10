import {useDataHook} from "model-react";
import {Network} from "vis-network";
import {AppState} from "../../../state/AppState";
import {useEffect} from "react";
import {IGraphDataMap} from "./_types/IGraphDataMaps";
import {
    graphEdgeConstrData,
    graphNodeConstrData,
} from "../../../state/valueTypes/GraphValueState";
import {IVal} from "../../../_types/IVal";

/**
 * Sets up the value highlighting synchronization for the given network
 * @param state The state to synchronize to
 * @param maps The node maps in the network
 * @param network The network visualization to sync with
 */
export function useGraphHighlight(
    state: AppState,
    maps: IGraphDataMap,
    network: Network | null
) {
    const [h] = useDataHook();

    const hover = state.getHoverHighlight(h);
    const highlight = state.getHighlight(h);
    useEffect(() => {
        if (!network) return;

        const highlightNodes: number[] = [];
        const highlightEdges: number[] = [];

        function add(v: IVal | null): void {
            const isConstr = v && v.type == "constr";
            if (isConstr) {
                const isNode = v.name == graphNodeConstrData.name;
                if (isNode) {
                    const val = v.children[0];
                    const hasNode = val.id in maps.nodeMap;
                    if (hasNode) highlightNodes.push(val.id);
                }

                const isEdge = v.name == graphEdgeConstrData.name;
                if (isEdge) {
                    const hasEdge = v.id in maps.edgeMap;
                    if (hasEdge) highlightEdges.push(v.id);
                }
            } else if (v) {
                const hasNode = v.id in maps.nodeMap;
                if (hasNode) highlightNodes.push(v.id);
            }
        }
        add(hover);
        add(highlight);

        network.setSelection({nodes: highlightNodes, edges: highlightEdges});
    }, [hover, highlight]);
    useEffect(() => {
        if (!network) return;

        const nodeHoverListener = ({node: id}: {node: string}) => {
            const node = maps.nodeMap[id];
            if (node) state.setHoverHighlight(node.id);
        };
        const nodeBlurListener = () => state.setHoverHighlight(null);
        network.on("hoverNode", nodeHoverListener);
        network.on("blurNode", nodeBlurListener);

        const edgeHoverListener = ({edge: id}: {edge: string}) => {
            const edge = maps.edgeMap[id];
            if (edge) state.setHoverHighlight(edge.id);
        };
        const edgeBlurListener = () => state.setHoverHighlight(null);
        network.on("hoverEdge", edgeHoverListener);
        network.on("blurEdge", edgeBlurListener);

        return () => {
            network.off("hoverNode", nodeHoverListener);
            network.off("blurNode", nodeBlurListener);
            network.off("hoverEdge", edgeHoverListener);
            network.off("blurEdge", edgeBlurListener);
        };
    }, [network]);
}
