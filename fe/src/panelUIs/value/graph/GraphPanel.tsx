import React, {FC, useEffect, useRef, useMemo, useLayoutEffect} from "react";
import {AppState} from "../../../state/AppState";
import {
    GraphValueState,
    graphEdgeConstrData,
    graphNodeConstrData,
} from "../../../state/valueTypes/GraphValueState";
import {useDataHook} from "model-react";
import {DataSet, Network, Data, Edge, Options, Node} from "vis-network";
import {useTheme} from "@fluentui/react";
import {
    IGraphEdgeData,
    IGraphNodeData,
} from "../../../state/valueTypes/_types/IGraphData";
import {IVal} from "../../../_types/IVal";
import {useGraphDataMaps} from "./useGraphDataMaps";
import {useGraphHighlight} from "./useGraphHighlight";
import {useGraphNetwork} from "./useGraphNetwork";
import {useGraphSync} from "./useGraphSync";
import {useGraphContextMenu} from "./useGraphContextMenu";

export const GraphPanel: FC<{state: AppState; graphState: GraphValueState}> = ({
    state,
    graphState,
}) => {
    const graphContainer = useRef<HTMLDivElement>(null);

    const [h] = useDataHook();
    const graphData = graphState.graph.get(h);

    const sharpness = state.getSettings(h).graph.sharpness;
    const network = useGraphNetwork(graphContainer, sharpness);
    useGraphSync(network, graphData);

    const maps = useGraphDataMaps(graphData);
    useGraphHighlight(state, maps, network);
    const contextMenu = useGraphContextMenu(state, maps, network);

    return (
        <>
            {contextMenu}
            <div ref={graphContainer}></div>
        </>
    );
};
