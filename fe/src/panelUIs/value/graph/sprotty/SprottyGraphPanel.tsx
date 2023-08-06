import "reflect-metadata";
import React, {FC, useEffect, useRef, useMemo, useLayoutEffect} from "react";
import {AppState} from "../../../../state/AppState";
import {
    GraphValueState,
    graphEdgeConstrData,
    graphNodeConstrData,
} from "../../../../state/valueTypes/GraphValueState";
import {useDataHook} from "model-react";
import {useTheme} from "@fluentui/react";
import {
    IGraphEdgeData,
    IGraphNodeData,
} from "../../../../state/valueTypes/_types/IGraphData";
import {IVal} from "../../../../_types/IVal";
import {useGraphContainer} from "./useGraphContainer";
import {useGraphValueSync} from "./useGraphValueSync";
import {css} from "@emotion/css";
import {useGraphStyle} from "./useGraphStyle";

export const SprottyGraphPanel: FC<{state: AppState; graphState: GraphValueState}> = ({
    state,
    graphState,
}) => {
    const graphContainer = useRef<HTMLDivElement>(null);

    const [h] = useDataHook();
    const diagram = useGraphContainer(graphContainer, graphState);
    useGraphValueSync(diagram, graphState);
    const graphStyle = useGraphStyle();

    return (
        <>
            {/* {contextMenu} */}
            <div ref={graphContainer} className={graphStyle}></div>
        </>
    );
};
