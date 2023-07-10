import {useEffect} from "react";
import {DataSet, Network, Data, Edge, Node} from "vis-network";
import {IGraphData} from "../../../state/valueTypes/_types/IGraphData";
import {useTheme} from "@fluentui/react";

/**
 * Takes care of node/edge synchronization between the state and this visualization
 * @param network The network to visualize the data in
 * @param graphData The data to be visualized
 */
export function useGraphSync(network: Network | null, graphData: IGraphData | null) {
    const theme = useTheme();
    useEffect(() => {
        if (!network || !graphData) return;

        // Format data
        const nodes = new DataSet<Node>(
            graphData.nodes.map(node => ({
                id: node.id.id,
                label: node.name,
                color: {
                    background: node.color ?? theme.palette.themeSecondary,
                    highlight: {
                        border: node.color ?? theme.palette.themeSecondary,
                        background: node.highlightColor ?? theme.palette.themeDarkAlt,
                    },
                    hover: {
                        border: node.color ?? theme.palette.themeSecondary,
                        background: node.highlightColor ?? theme.palette.themeDarkAlt,
                    },
                },
                font: {
                    color: theme.palette.black,
                },
                borderWidth: 0,
                // borderWidthSelected: 3,
            }))
        );
        const edges = new DataSet<Edge>(
            graphData.edges.map<Edge>(edge => ({
                id: edge.id.id,
                from: edge.start.id,
                to: edge.end.id,
                label: edge.name,
                arrows: {
                    to: {
                        enabled: !edge.undirected,
                        type: "triangle",
                        scaleFactor: 0.8,
                    },
                },
                arrowStrikethrough: true,
                endPointOffset: {
                    to: edge.undirected ? 0 : -2,
                },
                color: {
                    color: edge.color ?? theme.palette.themeTertiary,
                    highlight: edge.highlightColor ?? theme.palette.themeDarker,
                    hover: edge.highlightColor ?? theme.palette.themeDarker,
                },
                font: {
                    color: theme.palette.black,
                    strokeWidth: 2,
                    strokeColor: theme.palette.white,
                },
                width: 2,
            }))
        );
        const data: Data = {
            nodes: nodes,
            edges: edges,
        };
        network.setData(data);
    }, [network, graphData]);
}
