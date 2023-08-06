import {useEffect} from "react";
import {Diagram, GraphLinksModel} from "gojs";
import {GraphValueState} from "../../../../state/valueTypes/GraphValueState";
import {useDataHook} from "model-react";

export function useGraphValueSync(diagram: Diagram | null, graphState: GraphValueState) {
    const [h] = useDataHook();
    const graphData = graphState.graph.get(h);
    const positions = graphState.nodePositions.get(h);

    useEffect(() => {
        if (!diagram || !graphData) return;

        diagram.model = new GraphLinksModel(graphData.nodes, graphData.edges);
    }, [diagram, graphData]);
}
