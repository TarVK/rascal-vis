import {useEffect, useRef} from "react";
import {Network} from "vis-network";
import {GraphValueState} from "../../../state/valueTypes/GraphValueState";
import {useDataHook} from "model-react";
import {IGraphDataMap} from "./_types/IGraphDataMaps";
import {nonNullFilter} from "../../../utils/nonNullFilter";

/**
 * Synchronizes the view and node data between the state and the network visualization
 * @param graphState The graph state to sync to
 * @param maps The lookup maps to get nodes by their ids
 * @param network The network to sync with
 */
export function useGraphPositionsSync(
    graphState: GraphValueState,
    maps: IGraphDataMap,
    network: Network | null
): void {
    const [h] = useDataHook();
    const view = graphState.view.get(h);
    const positions = graphState.positions.get(h);
    const graph = graphState.graph.get(h);

    const ignoreIdData = useRef({set: 1, updated: 0});

    useEffect(() => {
        if (!network || !positions) return;

        // Ignore the update if it originated from this sync module
        const ignore = ignoreIdData.current.set > ignoreIdData.current.updated;
        ignoreIdData.current.updated = ignoreIdData.current.set;
        if (ignore) return;

        positions.forEach(({id, position}) => {
            network.moveNode(id.id, position.x, position.y);
        });
    }, [network, positions]);
    useEffect(() => {
        if (!network || !view) return;
        network.moveTo(view);
    }, [network, view, graph]);
    useEffect(() => {
        if (!network) return;
        const onMove = () => {
            const position = network.getViewPosition();
            const scale = network.getScale();
            graphState.view.set({
                position,
                scale,
            });
        };
        const onNodeMove = () => {
            const positionsObject = network.getPositions();
            const positions = Object.entries(positionsObject)
                .map(([id, position]) => {
                    const node = maps.nodeMap[id];
                    if (!node) return null;
                    return {id: node.id, position};
                })
                .filter(nonNullFilter);
            graphState.positions.set(positions);
            ignoreIdData.current.set++;
        };

        network.on("dragEnd", onMove);
        network.on("zoom", onMove);
        network.on("dragEnd", onNodeMove);
        network.on("stabilized", onNodeMove);
        return () => {
            network.off("dragEnd", onMove);
            network.off("zoom", onMove);
            network.on("dragEnd", onNodeMove);
            network.off("stabilized", onNodeMove);
        };
    }, [network]);
}
