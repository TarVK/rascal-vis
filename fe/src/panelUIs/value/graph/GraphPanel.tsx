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
import {useGraphValuesSync} from "./useGraphValuesSync";
import {useGraphContextMenu} from "./useGraphContextMenu";
import {useGraphPositionsSync} from "./useGraphPositionsSync";

export const GraphPanel: FC<{state: AppState; graphState: GraphValueState}> = ({
    state,
    graphState,
}) => {
    const graphContainer = useRef<HTMLDivElement>(null);

    const [h] = useDataHook();
    const maps = useGraphDataMaps(graphState.graph.get(h));

    const sharpness = state.getSettings(h).graph.sharpness;
    const network = useGraphNetwork(graphContainer, graphState, sharpness);
    useGraphValuesSync(network, graphState);
    useGraphPositionsSync(graphState, maps, network);

    useGraphHighlight(state, maps, network);
    const contextMenu = useGraphContextMenu(state, maps, network);

    return (
        <>
            {contextMenu}
            <div ref={graphContainer} style={{height: "100%"}}></div>
        </>
    );
};
