import {useEffect} from "react";
import ELK, {ElkNode, ElkExtendedEdge} from "elkjs/lib/elk.bundled";
import {GraphValueState} from "../../../../state/valueTypes/GraphValueState";
import {useDataHook} from "model-react";
import {Container} from "inversify";
import {SGraph, SEdge, SNode, SLabel} from "sprotty-protocol";
import {
    ActionDispatcher,
    EMPTY_ROOT,
    EdgePlacement,
    FitToScreenAction,
    IActionDispatcher,
    LocalModelSource,
    TYPES,
} from "sprotty";
import {NodeModel} from "./NodeModel";
import {IPoint} from "../../../../utils/_types/IPoint";
import {EdgeModel} from "./EdgeModel";

const elk = new ELK();
export function useGraphValueSync(
    diagram: Container | null,
    graphState: GraphValueState
) {
    const [h] = useDataHook();
    const graphData = graphState.graph.get(h);
    const positions = graphState.nodePositions.get(h);

    useEffect(() => {
        if (!diagram || !graphData) return;

        const charSize = 316 / 41;
        const minWidth = 30;
        const xPadding = 10;
        const nodeHeight = 30;
        const nodesWithSizes = graphData.nodes.map(({name, ...rest}) => ({
            ...rest,
            name: name ?? "",
            width: Math.max((name ?? "").length * charSize + xPadding * 2, minWidth),
            height: nodeHeight,
        }));
        const edgeLabelHeight = 20;
        const edgesWithSizes = graphData.edges.map(({name, ...rest}) => ({
            ...rest,
            ...(name && {
                name,
                width: name.length * charSize,
                height: edgeLabelHeight,
            }),
        }));

        const map = graphState.positionLookupMap.get();
        const spacing = 10;
        let hasPositions = false;
        const nodes = nodesWithSizes.map<ElkNode>(({id, width, height}) => {
            const p = map?.getNode(id.id + "");
            hasPositions ||= !!p;
            return {
                id: id.id + "",
                width,
                height,
                // "org.eclipse.elk.interactive": "true",
                // ...(p
                //     ? {
                //           x: p.position.x,
                //           y: p.position.y,
                //       }
                //     : {}),
            };
        });
        const edges = edgesWithSizes.map<ElkExtendedEdge>(
            ({id, start, end, name, width, height}) => ({
                id: id.id + "",
                sources: [start.id + ""],
                targets: [end.id + ""],
                // sections: [
                //     {
                //         startPoint: {x: 42, y: 56},
                //         endPoint: {x: 112, y: 56},
                //         bendPoints: [
                //             {x: 52, y: 56.499799615209355},
                //             {x: 52, y: 85},
                //             {x: 102.82926829268293, y: 85},
                //             {x: 102.82926829268293, y: 56.4997996152},
                //         ],
                //         id: end.id + "-" + start.id,
                //     },
                // ],
                labels: name
                    ? [
                          {
                              text: name,
                              height,
                              width,
                          },
                      ]
                    : undefined,
            })
        );

        const layoutData: ElkNode = {
            id: "root",
            layoutOptions: {
                algorithm: "layered",
                "org.eclipse.elk.spacing.nodeNode": spacing + "",
                "org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers": spacing + "",
                "org.eclipse.elk.core.options.EdgeRouting": "ORTHOGONAL",
                "org.eclipse.elk.layered.edgeLabels.sideSelection": "ALWAYS_UP",
                "org.eclipse.elk.spacing.edgeEdge": spacing + "",
                // "org.eclipse.elk.layered.nodePlacement.favorStraightEdges": "true",
                // ...(hasPositions
                //     ? {
                //           //   "org.eclipse.elk.interactiveLayout": "true",
                //           "org.eclipse.elk.layered.crossingMinimization.strategy":
                //               "INTERACTIVE",
                //           "org.eclipse.elk.layered.crossingMinimization.semiInteractive":
                //               "TRUE",
                //           "org.eclipse.elk.layered.nodePlacement.strategy": "INTERACTIVE",
                //           "org.eclipse.elk.layered.layering.strategy": "INTERACTIVE",
                //           "org.eclipse.elk.layered.edgeRouting.splines.mode":
                //               "CONSERVATIVE",
                //       }
                //     : {}),
            },
            children: nodes,
            edges,
        };

        let mounted = true;
        const modelSource = diagram.get<LocalModelSource>(TYPES.ModelSource);
        elk.layout(layoutData).then(layout => {
            console.log(layout);
            if (!mounted) return;
            const nodePoses = new Map<string, IPoint>();
            const edgeCorners = new Map<
                string,
                {
                    corners: IPoint[];
                    label?: IPoint;
                }
            >();

            layout.children?.forEach(({id, x, y}) => {
                if (!x || !y) return;
                nodePoses.set(id, {x, y});
            });
            layout.edges?.forEach(({id, sections, labels}) => {
                const section = sections?.[0];
                if (!section) return;
                const label = labels?.[0];
                edgeCorners.set(id, {
                    corners: [
                        section.startPoint,
                        ...(section.bendPoints ?? []),
                        section.endPoint,
                    ],
                    label: label && {x: label.x ?? 0, y: label.y ?? 0},
                });
            });

            const view = graphState.view.get();
            layout.children;
            const graph: SGraph = {
                type: "graph",
                id: "graph",
                // zoom:1,
                ...(view?.position ? {scroll: view.position, zoom: view.scale} : {}),
                children: [
                    ...nodesWithSizes.map<SNode & NodeModel>(
                        ({id, name, width, height, color}) => {
                            return {
                                type: "node",
                                id: id.id + "",
                                name: name ?? "",
                                color: color,
                                size: {width, height},
                                position: nodePoses.get(id.id + ""),
                            };
                        }
                    ),
                    ...edgesWithSizes.map<EdgeModel>(
                        ({id, start, end, name, undirected}) => {
                            const pos = edgeCorners.get(id.id + "");
                            return {
                                type: "edge",
                                id: id.id + "",
                                sourceId: start.id + "",
                                targetId: end.id + "",
                                routingPoints: pos?.corners ?? [],
                                routerKind: "mh",
                                directed: !undirected,
                                children: name
                                    ? [
                                          {
                                              id: id.id + "-label",
                                              type: "label:text",
                                              text: name,
                                              position: pos?.label,
                                              edgePlacement: {
                                                  position: 0.5,
                                                  side: "top",
                                                  rotate: false,
                                                  offset: 12,
                                              } as EdgePlacement,
                                          } as SLabel,
                                      ]
                                    : [],
                            };
                        }
                    ),
                ],
            };

            modelSource.setModel(graph);
            // if (!view)
            diagram
                .get<IActionDispatcher>(TYPES.IActionDispatcher)
                .dispatch(new FitToScreenAction([], 5, undefined, false));
        });

        return () => {
            console.log("Detects");
            mounted = false;
        };
    }, [diagram, graphData]);
}
