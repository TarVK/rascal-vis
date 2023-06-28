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
import {IContent} from "./_types/IContentGetter";
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
    components: ILayoutComponents;
}> = ({state, panel, components}) => {
    if (panel.type == "split")
        return <LayoutSplitPanel state={state} panel={panel} components={components} />;
    return <LayoutTabsPanel state={state} panel={panel} components={components} />;
};

export const LayoutSplitPanel: FC<{
    state: LayoutState;
    panel: IPanelSplitState;
    components: ILayoutComponents;
}> = ({state, panel, components}) => {
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
    components: ILayoutComponents;
}> = ({state, panel, components}) => {
    const [h] = useDataHook();
    const isDragging = !!state.getDraggingData(h);
    const orderedContents = panel.tabs
        .map(id => state.getContent(id, h))
        .filter((v): v is IContent => v != undefined);
    const selectedContent = orderedContents.find(({id}) => panel.selected == id);

    const tabData = orderedContents.map<ITabData>(({id, name, forceOpen}) => ({
        name,
        id,
        selected: id == panel.selected,
        forceOpen: forceOpen ?? false,
    }));

    const onDropTab = (beforeId: string) => {
        const dragging = state.getDraggingData();
        if (!dragging?.targetId) return;
        if (dragging.targetId == beforeId && dragging.removeFromPanelId == panel.id)
            return; // Nothing should change
        if (dragging.removeFromPanelId)
            state.closeTab(dragging.removeFromPanelId, dragging.targetId);
        state.openTab(panel.id, dragging.targetId, beforeId);
        state.selectTab(panel.id, dragging.targetId);
    };

    const onDropSide = (side: IDropPanelSide) => {
        const dragging = state.getDraggingData();
        if (!dragging?.targetId) return;

        // Insert in this tab
        if (side == "in") {
            if (dragging.removeFromPanelId == panel.id) return; // Nothing should change
            if (dragging.removeFromPanelId)
                state.closeTab(dragging.removeFromPanelId, dragging.targetId);
            state.openTab(panel.id, dragging.targetId);
            state.selectTab(panel.id, dragging.targetId);
            return;
        }

        // Or add a new panel
        const targetPanelId = state.addPanel(panel.id, side);
        if (targetPanelId) {
            if (dragging.removeFromPanelId)
                state.closeTab(dragging.removeFromPanelId, dragging.targetId);
            state.openTab(targetPanelId, dragging.targetId);
        }
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
                selectedTab={selectedContent?.id}
                dragging={isDragging}
                onDrop={onDropTab}
                state={state}
            />
            <components.TabsContent content={selectedContent?.content} />
            <components.DropArea dragging={isDragging} onDrop={onDropSide} />
        </components.TabsContainer>
    );
};
