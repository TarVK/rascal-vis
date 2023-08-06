import React, {RefObject, useState, useLayoutEffect} from "react";
import {Diagram} from "gojs";

/**
 * Creates a graph diagram object
 * @param graphContainer The container to mount the diagram in
 */
export function useGraphDiagram(
    graphContainer: RefObject<HTMLDivElement>
): Diagram | null {
    const [diagram, setDiagram] = useState<Diagram | null>(null);
    useLayoutEffect(() => {
        const container = graphContainer.current;
        if (!container) return;

        const diagram = new Diagram(container);
        setDiagram(diagram);
    }, []);

    return diagram;
}
