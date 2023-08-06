import React, {FC, useEffect, useRef, useMemo, useLayoutEffect} from "react";
import {AppState} from "../../../../state/AppState";
import {
    GraphValueState,
    graphEdgeConstrData,
    graphNodeConstrData,
} from "../../../../state/valueTypes/GraphValueState";
import {useDataHook} from "model-react";
import {DataSet, Network, Data, Edge, Options, Node} from "vis-network";
import {useTheme} from "@fluentui/react";
import {
    IGraphEdgeData,
    IGraphNodeData,
} from "../../../../state/valueTypes/_types/IGraphData";
import {IVal} from "../../../../_types/IVal";
import {useGraphDiagram} from "./useGraphDiagram";
import {useGraphTemplates} from "./useGraphTemplates";
import {useGraphValueSync} from "./useGraphValueSync";

export const GOGraphPanel: FC<{state: AppState; graphState: GraphValueState}> = ({
    state,
    graphState,
}) => {
    const graphContainer = useRef<HTMLDivElement>(null);

    const [h] = useDataHook();
    const diagram = useGraphDiagram(graphContainer);
    useGraphTemplates(diagram);
    useGraphValueSync(diagram, graphState);

    return (
        <>
            {/* {contextMenu} */}
            <div ref={graphContainer} style={{height: "100%"}}></div>
        </>
    );
};
