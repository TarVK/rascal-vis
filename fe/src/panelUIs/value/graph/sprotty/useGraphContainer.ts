import React, {RefObject, useState, useLayoutEffect} from "react";
import {Container, ContainerModule} from "inversify";
import {
    configureModelElement,
    configureViewerOptions,
    loadDefaultModules,
    LocalModelSource,
    PolylineEdgeView,
    SEdge,
    SGraph,
    SGraphView,
    SNode,
    TYPES,
    ProjectedViewportView,
    ViewportRootElement,
    viewportModule,
    defaultModule,
    modelSourceModule,
    boundsModule,
    buttonModule,
    commandPaletteModule,
    contextMenuModule,
    decorationModule,
    edgeEditModule,
    edgeLayoutModule,
    expandModule,
    exportModule,
    fadeModule,
    hoverModule,
    labelEditModule,
    labelEditUiModule,
    moveModule,
    openModule,
    routingModule,
    selectModule,
    undoRedoModule,
    updateModule,
    zorderModule,
    SLabel,
    SLabelView,
    SRoutingHandle,
    SRoutingHandleView,
    EdgeRouterRegistry,
    ManhattanEdgeRouter,
    ManhattanEllipticAnchor,
    RECTANGULAR_ANCHOR_KIND,
    ManhattanRectangularAnchor,
    ELLIPTIC_ANCHOR_KIND,
    ManhattanDiamondAnchor,
    DIAMOND_ANCHOR_KIND,
    SRoutableElement,
    DefaultAnchors,
    ActionHandlerRegistry,
    ActionDispatcher,
    FitToScreenAction,
    KeyListener,
    SModelElement,
    Action,
    CenterAction,
    IVNodePostprocessor,
    ModelViewer,
    Viewport,
    SModelRoot,
    MoveCommand,
    SChildElement,
    ConsoleLogger,
} from "sprotty";

import {almostEquals, Bounds} from "sprotty-protocol/lib/utils/geometry";
import {v4 as uuid} from "uuid";
import {NodeView} from "./NodeView";
import {Point} from "sprotty-protocol";
import {
    CustomManhattanDiamondAnchor,
    CustomManhattanEdgeRouter,
    CustomManhattanEllipticAnchor,
    CustomManhattanRectangularAnchor,
} from "./CustomManhattanEdgeRouter";
import {EdgeView} from "./EdgeView";
import {matchesKeystroke} from "sprotty/lib/utils/keyboard";
import {ListenableViewer, ModelListener} from "./ListenableViewer";
import {GraphValueState} from "../../../../state/valueTypes/GraphValueState";
import {ListenableMoveCommand, MoveListener} from "./ListenableMoveCommand";
import {
    IGraphEdgePositions,
    IGraphNodePositions,
} from "../../../../state/valueTypes/_types/IGraphPositions";
import {IGraphEdgeData} from "../../../../state/valueTypes/_types/IGraphData";

export function useGraphContainer(
    graphContainer: RefObject<HTMLDivElement>,
    graphState: GraphValueState
) {
    const [container, setContainer] = useState<Container | null>(null);
    useLayoutEffect(() => {
        const containerParentEl = graphContainer.current;
        if (!containerParentEl || !graphState) return;
        const containerEl = document.createElement("div");
        containerEl.id = uuid();
        containerParentEl.appendChild(containerEl);

        const myModule = new ContainerModule((bind, unbind, isBound, rebind) => {
            rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
            bind(TYPES.ModelSource).to(LocalModelSource).inSingletonScope();

            const context = {bind, unbind, isBound, rebind};
            configureModelElement(context, "graph", SGraph, SGraphView);
            configureModelElement(context, "node", SNode, NodeView);
            configureModelElement(context, "edge", SEdge, EdgeView);
            configureModelElement(
                context,
                "svg",
                ViewportRootElement,
                ProjectedViewportView
            );
            configureModelElement(
                context,
                "routing-point",
                SRoutingHandle,
                SRoutingHandleView
            );
            configureModelElement(
                context,
                "volatile-routing-point",
                SRoutingHandle,
                SRoutingHandleView
            );
            configureModelElement(context, "label:text", SLabel, SLabelView);

            bind(CustomManhattanEdgeRouter).toSelf().inSingletonScope();
            bind(TYPES.IEdgeRouter).toService(CustomManhattanEdgeRouter);
            bind(CustomManhattanEllipticAnchor).toSelf().inSingletonScope();
            bind(TYPES.IAnchorComputer).toService(CustomManhattanEllipticAnchor);
            bind(CustomManhattanRectangularAnchor).toSelf().inSingletonScope();
            bind(TYPES.IAnchorComputer).toService(CustomManhattanRectangularAnchor);
            bind(CustomManhattanDiamondAnchor).toSelf().inSingletonScope();
            bind(TYPES.IAnchorComputer).toService(CustomManhattanDiamondAnchor);

            bind(CenterKeyboardListener).toSelf().inSingletonScope();
            bind(TYPES.KeyListener).toService(CenterKeyboardListener);

            // bind(TYPES.IVNodePostprocessor)
            //     .toDynamicValue((): IVNodePostprocessor => {
            //         return {
            //             decorate(vnode, element) {
            //                 if(vnode.sel=="")
            //                 return vnode;
            //             },
            //             postUpdate() {},
            //         };
            //     })
            //     .inSingletonScope();

            configureViewerOptions(context, {
                needsClientLayout: false,
                needsServerLayout: false,
                baseDiv: containerEl.id,
            });
            // rebind(ModelViewer).to(ListenableViewer);

            bind(ModelListener).toDynamicValue(
                () =>
                    new ModelListener((model: SModelRoot & Viewport) => {
                        const cur = graphState.view.get();
                        if (
                            model.scroll &&
                            model.zoom != undefined &&
                            (!cur ||
                                cur.position?.x != model.scroll?.x ||
                                cur.position?.y != model.scroll?.y ||
                                cur.scale != model.zoom)
                        )
                            graphState.view.set({
                                position: model.scroll,
                                scale: model.zoom,
                            });
                    })
            );
            rebind(ModelViewer).to(ListenableViewer).inSingletonScope();

            bind(MoveListener).toDynamicValue(
                () =>
                    new MoveListener(model => {
                        const nodePoses: IGraphNodePositions = [];
                        const edgePoses: IGraphEdgePositions = [];
                        const lookup = graphState.lookupMap.get();
                        if (!lookup) return;

                        const isNode = (c: SChildElement): c is SNode => c.type == "node";
                        const isEdge = (c: SChildElement): c is SEdge => c.type == "edge";

                        const usedEdges = new Set<IGraphEdgeData>();
                        model.children.forEach(child => {
                            if (isNode(child)) {
                                const node = lookup.getNode(child.id);
                                if (!node) return;
                                nodePoses.push({
                                    id: node.id,
                                    position: child.position,
                                });
                            }
                            if (isEdge(child)) {
                                const label = child.children.find(
                                    (c: SChildElement): c is SLabel =>
                                        c.type == "label:text"
                                )?.text;
                                const from = child.source?.id;
                                const to = child.target?.id;
                                if (!from || !to) return;
                                const edges = lookup.getEdges(from, to, label);

                                const edge = edges.find(edge => !usedEdges.has(edge));
                                if (!edge) return;
                                usedEdges.add(edge);

                                edgePoses.push({
                                    from: edge.start,
                                    to: edge.end,
                                    text: label,
                                    bends: child.routingPoints,
                                });
                            }
                        });

                        graphState.nodePositions.set(nodePoses);
                    })
            );
            rebind(MoveCommand).to(ListenableMoveCommand);
        });

        const container = new Container();
        // const modules = [
        //     defaultModule,
        //     modelSourceModule,
        //     // boundsModule,
        //     // buttonModule,
        //     // commandPaletteModule,
        //     // contextMenuModule,
        //     // decorationModule,
        //     // edgeEditModule,
        //     // edgeLayoutModule,
        //     // expandModule,
        //     // exportModule,
        //     // fadeModule,
        //     // hoverModule,
        //     // labelEditModule,
        //     // labelEditUiModule,
        //     moveModule,
        //     // openModule,
        //     routingModule,
        //     selectModule,
        //     // undoRedoModule,
        //     // updateModule,
        //     viewportModule,
        //     // zorderModule,
        //     myModule,
        // ];
        // container.load(...modules);
        loadDefaultModules(container);
        // container.get(EdgeRouterRegistry).deregister("manhattan");
        // container.unbind(ManhattanEdgeRouter);

        container.load(myModule);
        // const routerRegistry = container.get(EdgeRouterRegistry);
        setContainer(container);
    }, [graphState]);

    return container;
}

export class CenterKeyboardListener extends KeyListener {
    override keyDown(element: SModelElement, event: KeyboardEvent): Action[] {
        if (matchesKeystroke(event, "KeyC", "ctrlCmd")) return [new CenterAction([])];
        if (matchesKeystroke(event, "KeyF", "ctrlCmd"))
            return [new FitToScreenAction([], 5)];
        return [];
    }
}
