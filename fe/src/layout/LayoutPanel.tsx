import React, {FC, useRef, useMemo} from "react";
import {LayoutState} from "./LayoutState";
import {IPanelData, IPanelSplitData, IPanelTabsData} from "./_types/IPanelData";
import {
    PanelGroup,
    PanelResizeHandle,
    Panel,
    ImperativePanelGroupHandle,
} from "react-resizable-panels";
import {intersperse, intersperseDynamic} from "../utils/intersperse";
import {IPanelSplitState, IPanelState, IPanelTabsState} from "./_types/IPanelState";
import {ILayoutComponents} from "./_types/ILayourComponents";
import {useDataHook} from "model-react";
import {IContent, IContentGetter} from "./_types/IContentGetter";
import {ITabData} from "./_types/props/ITabsHeaderProps";
import {DropArea} from "./styledComponents/DropArea";
import {IDropPanelSide} from "./_types/IDropSide";
import {v4 as uuid} from "uuid";
import {usePersistentMemo} from "../utils/usePersistentMemo";

/**
 * The component for rendering a layout panel
 */
export const LayoutPanel: FC<{
    state: LayoutState;
    panel: IPanelState;
    getContent: IContentGetter;
    components: ILayoutComponents;
}> = props => {
    if (props.panel.type == "split")
        return <LayoutSplitPanel {...props} panel={props.panel} />;
    return <LayoutTabsPanel {...props} panel={props.panel} />;
};

export const LayoutSplitPanel: FC<{
    state: LayoutState;
    panel: IPanelSplitState;
    getContent: IContentGetter;
    components: ILayoutComponents;
}> = ({state, panel, components, getContent}) => {
    const [h] = useDataHook();
    const key = usePersistentMemo(uuid, [state.getLayoutState(h)]);
    return (
        <PanelGroup direction={panel.direction} ref={panel.handle} key={key}>
            {intersperseDynamic(
                panel.panels.map(panel => (
                    <Panel key={panel.content.id} defaultSize={panel.defaultWeight}>
                        <LayoutPanel
                            state={state}
                            panel={panel.content}
                            components={components}
                            getContent={getContent}
                        />
                    </Panel>
                )),
                i => (
                    <PanelResizeHandle key={panel.panels[i].content.id + "-sep"}>
                        <components.ResizeHandle direction={panel.direction} />
                    </PanelResizeHandle>
                )
            )}
        </PanelGroup>
    );
};

export const LayoutTabsPanel: FC<{
    state: LayoutState;
    panel: IPanelTabsState;
    getContent: IContentGetter;
    components: ILayoutComponents;
}> = ({state, panel, getContent, components}) => {
    const [h] = useDataHook();
    const isDragging = !!state.getDraggingData(h);
    const orderedContents = panel.tabs
        .map(({id}) => getContent(id, h))
        .filter((v): v is IContent => v != undefined);

    const tabData = orderedContents.flatMap<ITabData>(
        ({id, content, forceOpen, ...rest}) => {
            const elData = panel.tabs.find(tab => tab.id == id);
            if (!elData) return [];
            return [
                {
                    id,
                    element: elData.element,
                    ...rest,
                    selected: id == panel.selected,
                    forceOpen: forceOpen ?? false,
                },
            ];
        }
    );

    const onDropTab = (beforeId: string) => {
        state.batchChanges(() => {
            const dragging = state.getDraggingData();
            if (!dragging?.targetId) return;
            if (dragging.targetId == beforeId && dragging.removeFromPanelId == panel.id)
                return; // Nothing should change
            if (dragging.removeFromPanelId)
                state.closeTab(dragging.removeFromPanelId, dragging.targetId);
            state.openTab(panel.id, dragging.target ?? dragging.targetId, beforeId);
            state.selectTab(panel.id, dragging.targetId);
        });
    };

    const onDropSide = (side: IDropPanelSide) => {
        state.batchChanges(() => {
            const dragging = state.getDraggingData();
            if (!dragging?.targetId) return;

            // Insert in this tab
            if (side == "in") {
                if (dragging.removeFromPanelId == panel.id) return; // Nothing should change
                if (dragging.removeFromPanelId)
                    state.closeTab(dragging.removeFromPanelId, dragging.targetId);
                state.openTab(panel.id, dragging.target ?? dragging.targetId);
                state.selectTab(panel.id, dragging.targetId);
                return;
            }

            // Or add a new panel
            const targetPanelId = state.addPanel(panel.id, side);
            if (targetPanelId) {
                if (dragging.removeFromPanelId)
                    state.closeTab(dragging.removeFromPanelId, dragging.targetId);
                state.openTab(targetPanelId, dragging.target ?? dragging.targetId);
            }
        });
    };

    return (
        <components.TabsContainer>
            <components.TabsHeader
                tabs={tabData}
                onClose={() => {}}
                onSelectTab={id => state.selectTab(panel.id, id)}
                onCloseTab={id => state.closeTab(panel.id, id)}
                onDragStart={data =>
                    state.setDraggingData({
                        offset: {x: 0, y: 0},
                        removeFromPanelId: panel.id,
                        ...data,
                    })
                }
                selectedTab={panel.selected}
                dragging={isDragging}
                onDrop={onDropTab}
                state={state}
            />
            <components.TabsContent
                contents={tabData.map(({id, ...rest}) => ({
                    id,
                    selected: panel.selected == id,
                    ...rest,
                }))}
            />
            <components.DropArea dragging={isDragging} onDrop={onDropSide} />
        </components.TabsContainer>
    );
};
