import React from "react";
import {INode} from "react-accessible-treeview";
import {IValNode} from "../../../_types/IValNode";
import {useDragStart} from "../../../utils/useDragStart";
import {AppState} from "../../../state/AppState";
import {ValueHighlight} from "./ValueHighlight";
import {useTheme} from "@fluentui/react";
import {css} from "@emotion/css";
import {highlightTheme} from "../../../theme";

export function useValueDrag(element: INode, state: AppState) {
    const theme = useTheme();
    return useDragStart((start, offset, target) => {
        if (!isValNode(element)) return;
        const tab = state.openNode(element, false);
        if (!(target instanceof HTMLElement)) return;
        if (!tab) return;

        const width = target.getBoundingClientRect().width;
        const layoutState = state.getLayoutState();
        layoutState.setDraggingData({
            position: start,
            offset,
            targetId: tab.getID(),
            preview: (
                <ValueHighlight
                    value={element.value}
                    settings={state.getSettings().text}
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
    });
}

function isValNode(node: INode): node is IValNode {
    return "value" in node;
}
