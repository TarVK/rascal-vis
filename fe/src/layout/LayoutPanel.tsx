import React, {FC, useRef} from "react";
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
}> = ({state, panel, components}) => (
    <PanelGroup direction={panel.direction} ref={panel.handle}>
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
                <PanelResizeHandle key={i}>
                    <components.ResizeHandle direction={panel.direction} />
                </PanelResizeHandle>
            )
        )}
    </PanelGroup>
);

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

    const tabData = orderedContents.map<ITabData>(({id, name}) => ({
        name,
        id,
        selected: id == panel.selected,
    }));

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
                onDrop={beforeId => {
                    const dragging = state.getDraggingData();
                    if (!dragging?.targetId) return;
                    if (
                        dragging.targetId == beforeId &&
                        dragging.removeFromPanelId == panel.id
                    )
                        return; // Nothing should change
                    if (dragging.removeFromPanelId)
                        state.closeTab(dragging.removeFromPanelId, dragging.targetId);
                    state.openTab(panel.id, dragging.targetId, beforeId);
                }}
                state={state}
            />
            <components.TabsContent content={selectedContent?.content} />
        </components.TabsContainer>
    );
};
