import {ContextualMenu, IContextualMenuItem} from "@fluentui/react";
import React, {
    useMemo,
    useState,
    RefObject,
    useCallback,
    useEffect,
    MouseEvent as RMouseEvent,
} from "react";
import {Network, DataSet, Options} from "vis-network";
import {IVal} from "../../../../_types/IVal";
import {AppState} from "../../../../state/AppState";
import {IGraphDataMap} from "../_types/IGraphDataMaps";
import {IValNode} from "../../../../_types/IValNode";
import {StyledContextMenu} from "../../../../components/StyledContextMenu";
import {graphNodeConstrData} from "../../../../state/valueTypes/GraphValueState";
import {ASTtoText} from "../../../../value/ASTtoText";
import {copy} from "../../../../utils/copy";

/**
 * Sets up a context menu handler for the network
 * @param state The state to perform the context actions in
 * @param maps The maps of the nodes/edges
 * @param networkInp The network which to add a context menu to
 */
export function useGraphContextMenu(
    state: AppState,
    maps: IGraphDataMap,
    networkInp: Network | null
): JSX.Element {
    const [contextMenuTarget, setContextMenuTarget] = useState<MouseEvent | null>(null);
    const [target, setTarget] = useState<IValNode | null>(null);
    const onHideContextMenu = useCallback(() => setContextMenuTarget(null), []);

    const highlighted = state.getHighlight()?.id == target?.value.id;
    const contextMenu = useMemo<IContextualMenuItem[]>(() => {
        if (!target) return [];
        const value = target.value;
        if ("key" in value || value.type != "constr") return [];

        return [
            {
                key: "open",
                text: "Open in new tab",
                iconProps: {iconName: "OpenPaneMirrored"},
                onClick: () => void state.openNode(target),
            },
            {
                key: "copy",
                text: "Copy value text",
                iconProps: {iconName: "Copy"},
                onClick: () => copy(ASTtoText(value)),
            },
            {
                key: "focus",
                text: "Focus on value",
                iconProps: {iconName: "OpenFolderHorizontal"},
                onClick: () => {
                    state.reveal(value);
                    state.setHighlight(value);
                },
            },
            {
                checked: highlighted,
                canCheck: highlighted,
                key: "highlight",
                text: "Highlight value",
                iconProps: {iconName: "FabricTextHighlight"},
                onClick: () =>
                    highlighted ? state.setHighlight(null) : state.setHighlight(value),
            },
        ];
    }, [target, highlighted]);

    useEffect(() => {
        if (!networkInp) return;
        const network = networkInp;

        function getTarget(event: IClickEvent): IValNode | null {
            const clickPoint = event.pointer.DOM;

            const nodeId = network.getNodeAt(clickPoint);
            const node = maps.nodeMap[nodeId];
            if (node) return node.nodeSource;

            const edgeId = network.getEdgeAt(clickPoint);
            const edge = maps.edgeMap[edgeId];
            if (edge) return edge.nodeSource;

            return null;
        }

        const clickListener = (e: IClickEvent) => {
            const target = getTarget(e);
            if (target) {
                if (!("key" in target.value)) state.setHighlight(target.value);
                state.revealNodes([target]);
            } else {
                const selection = network.getSelection();
                const hasHighlight =
                    selection.edges.length > 0 || selection.nodes.length > 0;
                if (hasHighlight) state.setHighlight(null);
            }
            return false;
        };
        networkInp.on("click", clickListener);

        const contextListener = (e: IClickEvent) => {
            const target = getTarget(e);
            if (target) {
                setTarget(target);
                setContextMenuTarget(e.event);
            }
            e.event.preventDefault();
        };
        networkInp.on("oncontext", contextListener);

        return () => {
            networkInp.off("oncontext", contextListener);
            networkInp.off("click", clickListener);
        };
    }, [networkInp, maps]);

    return (
        <StyledContextMenu
            items={contextMenu}
            hidden={!contextMenuTarget}
            target={contextMenuTarget}
            onItemClick={onHideContextMenu}
            onDismiss={onHideContextMenu}
        />
    );
}

type IClickEvent = {
    event: MouseEvent;
    pointer: {
        DOM: IPoint;
        canvas: IPoint;
    };
    edges: number[];
    nodes: number[];
};
type IPoint = {x: number; y: number};
