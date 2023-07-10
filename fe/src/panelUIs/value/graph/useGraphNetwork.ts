import {Network, DataSet, Options} from "vis-network";
import {useEffect, useRef, useMemo, useLayoutEffect, RefObject, useState} from "react";
import {GraphValueState} from "../../../state/valueTypes/GraphValueState";

/**
 * Initializes the graph network in the given container, and takes care of resizing/sharpening
 * @param graphContainer The container that the graph should be displayed in
 * @param graphState The graph state to sync to
 * @param sharpness The sharpness factor to use
 * @returns The network
 */
export function useGraphNetwork(
    graphContainer: RefObject<HTMLDivElement>,
    graphState: GraphValueState,
    sharpness: number
): Network | null {
    const networkRef = useRef<Network | null>(null);
    const [network, setNetwork] = useState<Network | null>(null);
    useLayoutEffect(() => {
        const container = graphContainer.current;
        if (!container) return;

        const view = graphState.view.get();
        const options: Options = {
            layout: {randomSeed: 1},
            physics: {
                stabilization: {
                    fit: view == null,
                },
                minVelocity: 0.02,
            },
            autoResize: false,
            interaction: {hover: true, selectable: false},
        };
        const network = (networkRef.current = new Network(
            container,
            {
                nodes: new DataSet(),
                edges: new DataSet(),
            },
            options
        ));
        setNetwork(network);
        return () => network.destroy();
    }, []);

    useLayoutEffect(() => {
        const container = graphContainer.current;
        if (!container || !network) return;

        const observer = new ResizeObserver(() => {
            const size = container.getBoundingClientRect();
            window.devicePixelRatio = sharpness;
            network.setSize(`${size.width}px`, `${size.height}px`);

            const view = graphState.view.get();
            if (view) network.moveTo(view);

            network.redraw();
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, [network, graphContainer.current, sharpness]);

    return network;
}
