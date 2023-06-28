import {Field, IDataHook, IDataRetriever} from "model-react";
import {IContent, IContentGetter} from "./_types/IContentGetter";
import {IPanelData, IPanelSplitData} from "./_types/IPanelData";
import {
    IPanelSplitState,
    IPanelSplitStatePanel,
    IPanelState,
    IPanelTabsState,
} from "./_types/IPanelState";
import {IDragData} from "./_types/IDragData";
import {IDropPanelSplitSide} from "./_types/IDropSide";
import {v4 as uuid} from "uuid";
import {ILayoutSettings} from "./_types/ILayoutSettings";

/**
 * A component to store the layout of the application
 */
export class LayoutState {
    public readonly getContent: IContentGetter;

    /** The current layout */
    protected layout = new Field<IPanelState>({
        type: "tabs",
        id: "0",
        tabs: ["0", "1", "2", "3", "4"],
        selected: "0",
    });

    protected dragging = new Field<null | IDragData>(null);

    protected settings = new Field<ILayoutSettings>({
        closeEmptyPanel: true,
    });

    /***
     * Creates a new layout state, using the content getter to specify the content of the layout
     */
    public constructor(
        contentGetter: IContentGetter,
        settings: Partial<ILayoutSettings> = {}
    ) {
        this.getContent = contentGetter;

        this.settings.set({...this.settings.get(), ...settings});
    }

    /**
     * Retrieves the layout settings
     * @param hook The hook to subscribe to changes
     * @returns The current layout settings
     */
    public getSettings(hook?: IDataHook): ILayoutSettings {
        return this.settings.get(hook);
    }

    /**
     * Sets the current layout settings
     * @param setting The new layout settings
     */
    public setSettings(settings: ILayoutSettings): void {
        this.settings.set(settings);
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
    /**
     * Removes the given panel from the layout
     * @param panelId The panel to be removed
     */
    public removePanel(panelId: string): void {
        const currentLayout = updateDefaultWeights(this.layout.get());
        const newLayout = removePanel(currentLayout, panelId);
        if (!newLayout) this.layout.set({type: "tabs", id: "0", tabs: []});
        else this.layout.set(newLayout);
    }

    /**
     * Adds a new panel to the layout
     * @param nextToId The id of the panel to add the panel next to
     * @param side The side to add the panel to
     * @returns The id of the created panel
     */
    public addPanel(nextToId: string, side: IDropPanelSplitSide): string | null {
        const currentLayout = updateDefaultWeights(this.layout.get());
        const [newState, newId] = addPanel(currentLayout, nextToId, side);
        if (newId != null) this.layout.set(newState);
        return newId;
    }

    // Tabs modification
    /**
     * Closes the specified tab from the given panel
     * @param panelId The id of the panel in which to close the tab
     * @param tabId The id of the tab to close
     */
    public closeTab(panelId: string, tabId: string): void {
        const currentLayout = updateDefaultWeights(this.layout.get());
        let isNowEmpty = false;
        let newLayout = modifyTabs(
            currentLayout,
            panelId,
            ({tabs, selected, ...data}) => {
                const index = tabs.indexOf(tabId);
                const newTabs = tabs.filter(tab => tab != tabId);
                if (newTabs.length == 0) isNowEmpty = true;
                return {
                    ...data,
                    tabs: newTabs,
                    selected: newTabs[Math.max(0, Math.min(index, newTabs.length - 1))],
                };
            }
        );

        if (isNowEmpty && this.settings.get().closeEmptyPanel) {
            const removed = removePanel(newLayout, panelId);
            if (removed != null) newLayout = removed;
        }

        this.layout.set(newLayout);
    }

    /**
     * Opens the specified tab in the given panel
     * @param panelId The id of the panel in which to open the tab
     * @param tabId The id of the tab to open
     * @param beforeTabId The id of the tab to place the new tab in front of
     */
    public openTab(panelId: string, tabId: string, beforeTabId?: string): void {
        const currentLayout = updateDefaultWeights(this.layout.get());
        const newLayout = modifyTabs(
            currentLayout,
            panelId,
            ({tabs, selected, ...data}) => {
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
                    selected: selected ?? tabId,
                };
            }
        );
        this.layout.set(newLayout);
    }

    /**
     * Selects the specified tab in the given panel
     * @param panelId The id of the panel in which to change the selection
     * @param tabId The id of the tab to select
     */
    public selectTab(panelId: string, tabId: string): void {
        const currentLayout = updateDefaultWeights(this.layout.get());
        const newLayout = modifyTabs(currentLayout, panelId, ({selected, ...data}) => ({
            ...data,
            selected: data.tabs.includes(tabId) ? tabId : selected,
        }));
        this.layout.set(newLayout);
    }
}

/**
 * Retrieves the data
 * @param state The state to get the serializable data for
 * @returns The serializable data
 */
export function panelStateToData(state: IPanelState): IPanelData {
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
export function panelDataToState(data: IPanelData): IPanelState {
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
export function getStateContents(state: IPanelState): string[] {
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
export function modifyTabs(
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
    else if (state.id == panelId) return modify(state);
    else return state;
}

/**
 * Retrieves the state with all default weights updated to be up to date with the current weights
 * @param state The state to update the default weights for
 * @returns The updated state
 */
export function updateDefaultWeights(state: IPanelState): IPanelState {
    if (state.type == "tabs") return state;

    const handle = state.handle.current;
    const panels = state.panels;
    if (!handle)
        return {
            ...state,
            panels: panels.map(({defaultWeight, content}) => ({
                defaultWeight,
                content: updateDefaultWeights(content),
            })),
        };

    let newWeights = handle.getLayout();
    // Make sure there's not too many values
    if (newWeights.length > panels.length)
        newWeights = newWeights.slice(0, panels.length);

    // Make sure there's enough value
    const avgWeight = newWeights.reduce((a, b) => a + b) / newWeights.length;
    if (newWeights.length < panels.length)
        newWeights = [
            ...newWeights,
            ...new Array(panels.length - newWeights.length).fill(avgWeight),
        ];

    // Make sure the values add up to 100
    const adjustment = 100 / (avgWeight * newWeights.length);
    newWeights = newWeights.map(weight => weight * adjustment);

    return {
        ...state,
        panels: balanceDefaultWeights(
            panels.map(({content}, i) => ({
                defaultWeight: newWeights[i],
                content: updateDefaultWeights(content),
            }))
        ),
    };
}

/**
 * Ensures that the default weights add up to 100
 * @param panels The panels for which to ensure their sums add up
 * @return The balanced sums
 */
function balanceDefaultWeights(panels: IPanelSplitStatePanel[]): IPanelSplitStatePanel[] {
    const sum = panels.reduce((sum, {defaultWeight}) => sum + defaultWeight, 0);
    if (sum > 100)
        panels = panels.map(({defaultWeight, content}) => ({
            defaultWeight: (defaultWeight / sum) * 99, // 99 Instead of 100 to account for possible rounding issues
            content,
        }));
    if (sum == 100) return panels;

    const firstPanels = panels.slice(0, panels.length - 1);
    const lastPanel = panels[panels.length - 1];
    const firstItemsSum = firstPanels.reduce(
        (sum, {defaultWeight}) => sum + defaultWeight,
        0
    );
    const lastWeight = 100 - firstItemsSum;
    return [...firstPanels, {defaultWeight: lastWeight, content: lastPanel.content}];
}

/**
 * Removes the given panel from the state
 * @param state The state to modify
 * @param panelId The panel id to be removed
 * @returns The modified state
 */
export function removePanel(state: IPanelState, panelId: string): IPanelState | null {
    if (state.id == panelId) return null;
    else if (state.type == "tabs") return state;
    else {
        const newPanels = state.panels
            .map(({defaultWeight, content}) => ({
                defaultWeight,
                content: removePanel(content, panelId),
            }))
            .filter((v): v is IPanelSplitStatePanel => !!v.content);
        if (newPanels.length == 0) return null;
        if (newPanels.length == 1) return newPanels[0].content;

        const weightSumFraction =
            newPanels.reduce((v, {defaultWeight}) => v + defaultWeight, 0) / 100;
        const panelsCorrectWeight = balanceDefaultWeights(
            newPanels.map(({defaultWeight, content}) => ({
                defaultWeight: defaultWeight / weightSumFraction,
                content,
            }))
        );
        return {
            ...state,
            panels: panelsCorrectWeight,
        };
    }
}

/**
 * Adds a panel to the given state
 * @param state The state to modify
 * @param nextToId The id of the panel to open the panel next to
 * @param side The side of the panel to open the panel next to
 */
export function addPanel(
    state: IPanelState,
    nextToId: string,
    side: IDropPanelSplitSide
): [IPanelState, string | null] {
    const axis = side == "north" || side == "south" ? "vertical" : "horizontal";

    if (nextToId == state.id) {
        // Add a new split
        const newId = uuid();
        const after = side == "east" || side == "south";
        const newTabs: IPanelSplitStatePanel = {
            defaultWeight: 50,
            content: {
                type: "tabs",
                id: newId,
                tabs: [],
            },
        };
        return [
            {
                type: "split",
                id: uuid(),
                direction: axis,
                handle: {current: null},
                panels: after
                    ? [{defaultWeight: 50, content: state}, newTabs]
                    : [newTabs, {defaultWeight: 50, content: state}],
            },
            newId,
        ];
    } else if (state.type == "tabs") return [state, null];
    else {
        // Add to an already existing split
        const hasNeighborIndex = state.panels.findIndex(
            ({content}) => content.id == nextToId
        );
        if (hasNeighborIndex != -1) {
            const sameSide = axis == state.direction;
            if (sameSide) {
                const averageWeight =
                    state.panels.reduce((v, {defaultWeight}) => v + defaultWeight, 0) /
                    state.panels.length;
                const adjustment = 100 / (100 + averageWeight);
                const newId = uuid();
                const newPanel: IPanelSplitStatePanel = {
                    defaultWeight: adjustment * averageWeight,
                    content: {
                        type: "tabs",
                        id: newId,
                        tabs: [],
                    },
                };
                const index =
                    hasNeighborIndex + (side == "east" || side == "south" ? 1 : 0);
                const correctedPanels = state.panels.map(({defaultWeight, content}) => ({
                    defaultWeight: adjustment * defaultWeight,
                    content,
                }));
                return [
                    {
                        ...state,
                        panels: balanceDefaultWeights([
                            ...correctedPanels.slice(0, index),
                            newPanel,
                            ...correctedPanels.slice(index),
                        ]),
                    },
                    newId,
                ];
            }
        }

        // Try to add the new panel down the tree
        const newPanels = state.panels.map(({defaultWeight, content}) => {
            const [result, newId] = addPanel(content, nextToId, side);
            return [{defaultWeight, content: result}, newId] as const;
        });
        const newId = newPanels.find(([, newId]) => newId != null)?.[1] ?? null;
        const panels = newPanels.map(([data]) => data);
        return [
            {
                ...state,
                panels,
            },
            newId,
        ];
    }
}
