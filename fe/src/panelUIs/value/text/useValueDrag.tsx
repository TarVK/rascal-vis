import React from "react";
import {INode} from "react-accessible-treeview";
import {IValNode} from "../../../_types/IValNode";
import {useDragStart} from "../../../utils/useDragStart";
import {AppState} from "../../../state/AppState";
import {ValueHighlight} from "./ValueHighlight";
import {useTheme} from "@fluentui/react";
import {highlightTheme} from "./highlightTheme";
import {css} from "@emotion/css";

export function useValueDrag(element: INode, state: AppState) {
    const theme = useTheme();
    return useDragStart((start, offset, target) => {
        if (!isValNode(element)) return;
        const tab = state.openNode(element, false);
        if (!(target instanceof HTMLElement)) return;

        const width = target.getBoundingClientRect().width;
        if (tab) {
            const layoutState = state.getLayoutState();
            layoutState.setDraggingData({
                position: start,
                offset,
                targetId: tab.getID(),
                preview: (
                    <ValueHighlight
                        value={element.value}
                        className={css({
                            width,
                            ".wrapper": {
                                backgroundColor: theme.palette.neutralLighter,
                                display: "inline-block",
                            },
                            ...highlightTheme(theme),
                        })}
                        wrapElement={text => <div className="wrapper">{text}</div>}
                    />
                ),
            });
            layoutState.addCloseHandler(tab.getID(), () => state.removePanel(tab));
        }
    });
}

function isValNode(node: INode): node is IValNode {
    return "value" in node;
}
