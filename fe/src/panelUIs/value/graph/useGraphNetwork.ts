import {Network, DataSet, Options} from "vis-network";
import {useEffect, useRef, useMemo, useLayoutEffect, RefObject, useState} from "react";

/**
 * Initializes the graph network in the given container, and takes care of resizing/sharpening
 * @param graphContainer The container that the graph should be displayed in
 * @param sharpness The sharpness factor to use
 * @returns The network
 */
export function useGraphNetwork(
    graphContainer: RefObject<HTMLDivElement>,
    sharpness: number
): Network | null {
    const networkRef = useRef<Network | null>(null);
    const [network, setNetwork] = useState<Network | null>(null);
    useLayoutEffect(() => {
        const container = graphContainer.current;
        if (!container) return;

        const options: Options = {
            layout: {randomSeed: 1},
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
            network.redraw();
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, [network, graphContainer.current, sharpness]);

    return network;
}
