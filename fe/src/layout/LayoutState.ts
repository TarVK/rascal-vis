import {Field, IDataHook, IDataRetriever} from "model-react";
import {IContent, IContentGetter} from "./_types/IContentGetter";
import {IPanelData, IPanelSplitData} from "./_types/IPanelData";
import {IPanelState, IPanelTabsState} from "./_types/IPanelState";
import {IDragData} from "./_types/IDragData";

/**
 * A component to store the layout of the application
 */
export class LayoutState {
    public readonly getContent: IContentGetter;

    /** The current layout */
    // protected layout = new Field<IPanelState>({
    //     type: "tabs",
    //     id: "0",
    //     tabsOrder: [],
    //     selected: "",
    // });
    protected layout = new Field<IPanelState>({
        type: "split",
        direction: "horizontal",
        id: "24",
        handle: {current: null},
        panels: [
            {
                defaultWeight: 70,
                content: {
                    type: "tabs",
                    id: "0",
                    tabs: ["2", "3"],
                    selected: "3",
                },
            },
            {
                defaultWeight: 30,
                content: {
                    type: "tabs",
                    id: "4",
                    tabs: ["5", "6"],
                    selected: "5",
                },
            },
        ],
    });

    protected dragging = new Field<null | IDragData>(null);

    /***
     * Creates a new layout state, using the content getter to specify the content of the layout
     */
    public constructor(contentGetter: IContentGetter) {
        this.getContent = contentGetter;
    }

    // Layout data
    /**
     * Loads the given layout
     * @param layout The layout to be loaded
     */
    public loadLayout(layout: IPanelData): void {
        this.layout.set(panelDataToState(layout));
    }

    /**
     * Retrieves the current layout
     * @returns The current layout
     */
    public getLayout(): IPanelData {
        return panelStateToData(this.layout.get());
    }

    /**
     * Retrieves the current layout state data
     * @param hook The hook to subscribe to changes
     * @returns The layout state
     */
    public getLayoutState(hook?: IDataHook): IPanelState {
        return this.layout.get(hook);
    }

    /**
     * Retrieves all the content ids that are being rendered
     * @param hook The hook to subscribe to changes
     * @returns All the opened content ids
     */
    public getAllContentIDs(hook?: IDataHook): string[] {
        return getStateContents(this.layout.get(hook));
    }

    // Dragging data
    /**
     * Sets the current dragging data
     * @param dragData The data for dragging
     */
    public setDraggingData(dragData: null | IDragData): void {
        this.dragging.set(dragData);
    }

    /**
     * Retrieves the currently dragging data
     * @param hook The hook to subscribe to changes
     * @returns The data of the content currently being dragged to a new position
     */
    public getDraggingData(hook?: IDataHook): null | IDragData {
        return this.dragging.get(hook);
    }

    // Layout modification

    // Tabs modification
    /**
     * Closes the specified tab from the given panel
     * @param panelId The id of the panel in which to close the tab
     * @param tabId The id of the tab to close
     */
    public closeTab(panelId: string, tabId: string): void {
        this.layout.set(
            modifyTabs(this.layout.get(), panelId, ({tabs, selected, ...data}) => {
                const index = tabs.indexOf(tabId);
                const newTabs = tabs.filter(tab => tab != tabId);
                return {
                    ...data,
                    tabs: newTabs,
                    selected: newTabs[Math.max(0, Math.min(index, newTabs.length - 1))],
                };
            })
        );
    }

    /**
     * Opens the specified tab in the given panel
     * @param panelId The id of the panel in which to open the tab
     * @param tabId The id of the tab to open
     * @param beforeTabId The id of the tab to place the new tab in front of
     */
    public openTab(panelId: string, tabId: string, beforeTabId?: string): void {
        this.layout.set(
            modifyTabs(this.layout.get(), panelId, ({tabs, ...data}) => {
                const filteredTabs = tabs.filter(tab => tab != tabId);
                let targetIndex = beforeTabId ? filteredTabs.indexOf(beforeTabId) : -1;
                if (beforeTabId == tabId) targetIndex = tabs.indexOf(beforeTabId);
                if (targetIndex < 0) targetIndex = filteredTabs.length;
                return {
                    ...data,
                    tabs: [
                        ...filteredTabs.slice(0, targetIndex),
                        tabId,
                        ...filteredTabs.slice(targetIndex),
                    ],
                };
            })
        );
    }

    /**
     * Selects the specified tab in the given panel
     * @param panelId The id of the panel in which to change the selection
     * @param tabId The id of the tab to select
     */
    public selectTab(panelId: string, tabId: string): void {
        this.layout.set(
            modifyTabs(this.layout.get(), panelId, ({selected, ...data}) => ({
                ...data,
                selected: data.tabs.includes(tabId) ? tabId : selected,
            }))
        );
    }
}

/**
 * Retrieves the data
 * @param state The state to get the serializable data for
 * @returns The serializable data
 */
function panelStateToData(state: IPanelState): IPanelData {
    if (state.type == "split") {
        const weights = state.handle.current?.getLayout();
        return {
            ...state,
            panels: state.panels.map(({defaultWeight, content}, i) => ({
                weight: weights?.[i] ?? defaultWeight,
                content: panelStateToData(content),
            })),
        };
    } else return state;
}

/**
 * Retrieves the state
 * @param data The serializable state
 * @returns The state data for this state
 */
function panelDataToState(data: IPanelData): IPanelState {
    if (data.type == "split")
        return {
            ...data,
            handle: {current: null},
            panels: data.panels.map(({weight, content}, i) => ({
                defaultWeight: weight,
                content: panelDataToState(content),
            })),
        };
    else return data;
}

/**
 * Retrieves all of the content IDs that are currently rendered
 * @param state The state to get the content ids from
 * @returns The content ids
 */
function getStateContents(state: IPanelState): string[] {
    if (state.type == "split")
        return state.panels.flatMap(panel => getStateContents(panel.content));
    return state.tabs;
}

/**
 * Modifies the tabs panel with the given id
 * @param state The state to modify
 * @param panelId The panel to modify
 * @param modify The modification
 * @returns The modified layout
 */
function modifyTabs(
    state: IPanelState,
    panelId: string,
    modify: (state: IPanelTabsState) => IPanelTabsState
): IPanelState {
    if (state.type == "split")
        return {
            ...state,
            panels: state.panels.map(data => ({
                ...data,
                content: modifyTabs(data.content, panelId, modify),
            })),
        };
    else if (state.id != panelId) return state;
    else return modify(state);
}
