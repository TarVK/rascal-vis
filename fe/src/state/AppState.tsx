import React, {MouseEvent} from "react";
import {DataCacher, Field, IDataHook} from "model-react";
import {IEntry, IVal, IValPlain} from "../_types/IVal";
import {value} from "../value/parser";
import {Failure, Result} from "parsimmon";
import {fixReferences} from "../value/fixReferences";
import {ValuePanelState} from "./ValuePanelState";
import {LayoutState} from "../layout/LayoutState";
import {IContent} from "../layout/_types/IContentGetter";
import {IPanelComponents} from "../_types/IPanelComponents";
import {createValueNodes} from "../value/createValueNodes";
import {IValNode} from "../_types/IValNode";
import {IValMap} from "../_types/IValMap";
import {getName} from "../value/getName";
import {PanelState} from "./PanelState";
import {SpecialTabsState} from "./SpecialTabsState";
import {TDeepPartial} from "./_types/TDeepPartial";
import {ISettings} from "./_types/ISettings";
import {getValueProfile} from "./valueData/getValueProfile";
import {getValueHighlight} from "./valueData/getValueHighlight";
import {NodeId} from "react-accessible-treeview";
import {getValueTabs} from "./valueData/getValueTabs";
import {IGlobalSettings} from "./_types/IGlobalSettings";

/**
 * Representing all application state data
 */
export class AppState {
    protected highlighting = new Field<IVal | IEntry | null>(null);
    protected hoverHighlighting = new Field<IVal | IEntry | null>(null);

    protected valueText = new Field<null | string>(null);
    protected parseData = new DataCacher<null | Result<IValPlain>>(h => {
        const text = this.valueText.get(h);
        if (text == null) return null;
        return value.parse(text);
    });

    public specialTabs: SpecialTabsState;

    public constructor() {
        this.specialTabs = new SpecialTabsState(this);
    }

    /**
     * A parse error, if any mistakes in parsing occurred (shouldn't happen, but maybe if we have implementation mistakes)
     */
    public parseError = new DataCacher<null | Failure>(h => {
        const result = this.parseData.get(h);
        if (result?.status == false) return result;
        return null;
    });

    /**
     * The value data
     */
    public valueData = new DataCacher<null | [IValNode[], IValMap]>(h => {
        const result = this.parseData.get(h);
        if (result?.status) {
            const deduped = fixReferences(result.value);
            return createValueNodes(deduped);
        }
        return null;
    });

    /**
     * The nodes of the value being visualized
     */
    public valueNodes = new DataCacher<null | IValNode[]>(h => {
        const valueData = this.valueData.get(h);
        if (valueData) return valueData[0];
        return null;
    });

    /**
     * A map for obtaining all nodes that contain a given value
     */
    public valueNodesMap = new DataCacher<null | IValMap>(h => {
        const valueData = this.valueData.get(h);
        if (valueData) return valueData[1];
        return null;
    });

    /**
     * Sets the value text
     * @param text The text to be used
     */
    public setValueText(text: string | null): void {
        this.valueText.set(text);
        const valueNodes = this.valueNodes.get();
        const nodes = !valueNodes ? [] : this.getNodes(valueNodes[0]) ?? [];

        this.initializeStateFromValue(nodes);
    }

    /**
     * Retrieves the current value's text
     * @param hook The hook to subscribe to changes
     * @returns the current value text
     */
    public getValueText(hook?: IDataHook): string | null {
        return this.valueText.get(hook);
    }

    /**
     * Reassigns each value to the appropriate tab, should be called when changing the layout without reloading the value
     */
    public reloadTabValues() {
        const valueNodes = this.valueNodes.get();

        const nodes = !valueNodes ? [] : this.getNodes(valueNodes[0]) ?? [];

        const map: Map<NodeId, IValNode> = new Map();
        for (let node of nodes) map.set(node.id, node);

        this.loadTabValues(nodes, map);
    }

    /**
     * Initializes all data obtained from the given nodes
     * @param nodes The nodes to initialize from
     */
    protected initializeStateFromValue(nodes: IValNode[]) {
        const map: Map<NodeId, IValNode> = new Map();
        for (let node of nodes) map.set(node.id, node);

        // Load the profile data
        const profileData = getValueProfile(nodes);
        const settings = this.specialTabs.settings;
        const valueInput = this.specialTabs.input;
        if (
            profileData.selected &&
            settings.getProfileName() != profileData.selected &&
            valueInput.getInputSourceType() == "server" // Don't load it on manual, since this may prevent a profile from being selected alltogether since it could instantly change the profile
        ) {
            this.saveProfile();
            const profiles = settings.getProfiles();
            const profile = profiles.find(({name}) => name == profileData.selected);
            if (!profile) {
                if (profileData.init) {
                    const initProfile = profiles.find(
                        ({name}) => name == profileData.init
                    );
                    if (initProfile) settings.loadProfile(initProfile);
                }
                settings.addAndSelectProfile(profileData.selected);
            } else {
                settings.loadProfile(profile);
            }
        }
        if (profileData.update) this.updateSettings(profileData.update);

        // Set the root value
        this.specialTabs.root.setValueNodes(nodes);

        // Load tabs
        this.loadTabValues(nodes, map);

        // Load highlight data
        const highlightData = getValueHighlight(nodes, map);
        if (highlightData.highlight) this.setHighlight(highlightData.highlight);
        if (highlightData.expand.length > 0) this.revealNodes(highlightData.expand);
    }

    /**
     * Assigns values to the right tabs
     * @param nodes The nodes to be assigned to tabs
     * @param map The node map for lookups
     */
    protected loadTabValues(nodes: IValNode[], map: Map<NodeId, IValNode>) {
        const panels = Object.values(this.panels.get()).filter(
            (panel): panel is ValuePanelState =>
                panel instanceof ValuePanelState && panel.getID() != "root"
        );
        const nonAssignedPanels = new Set<ValuePanelState>(panels);

        const tabsData = getValueTabs(nodes, map);
        const layout = this.layoutState;
        const tabPanels = layout.getAllTabPanels();
        for (let tabData of tabsData) {
            let panel: ValuePanelState | undefined | null = panels.find(
                panel => panel.getName() == tabData.name
            );
            if (!panel) {
                const copy = panels.find(panel => panel.getName() == tabData.init);

                // Initialize from another panel
                if (copy) {
                    const parent = tabPanels.find(parent =>
                        parent.tabs.some(({id}) => id == copy.getID())
                    );
                    panel = this.openNode(tabData.node, !parent);
                    if (!panel) continue;

                    const copyData = {...copy.serialize(), id: panel.getID()};
                    panel.deserialize(copyData);
                    if (parent) layout.openTab(parent.id, panel.getID());
                } else {
                    panel = this.openNode(tabData.node);
                }
            } else {
                // Initialize into an existing panel
                const nodes = this.getNodes(tabData.node);
                if (!nodes) continue;
                panel.setValueNodes(nodes);
                nonAssignedPanels.delete(panel);
            }
            if (panel) panel.setName(tabData.name);
        }

        // Assign remaining panels according to ids
        for (let panel of nonAssignedPanels) {
            const id = panel.getSourceNodeId();
            const node = map.get(id);
            if (!node) continue;
            const valNodes = this.getNodes(node);
            if (!valNodes) continue;
            panel.setValueNodes(valNodes);
            nonAssignedPanels.delete(panel);
        }

        // Set values of non assigned panels
        for (let panel of nonAssignedPanels) {
            panel.setValueNodes([]);
        }

        // Close unused panels
        if (this.getSettings().layout.deleteUnusedPanels)
            for (let panel of nonAssignedPanels) {
                if (panel.getValueNodes().length == 0) {
                    this.removePanel(panel);
                }
            }
    }

    // Layout data
    protected panels = new Field<Record<string, PanelState>>({});
    protected layoutState = new LayoutState();

    /**
     * Adds a panel to the app
     * @param panel The panel to be added
     * @param show Whether the panel should be opened in a new tab
     * @param deleteOnClose Whether the panel should be deleted if closed in the UI
     */
    public addPanel(
        panel: PanelState,
        show: boolean = true,
        deleteOnClose: boolean = true
    ): void {
        const current = this.panels.get();
        this.panels.set({
            ...current,
            [panel.getID()]: panel,
        });

        if (show) this.showPanel(panel);
        if (deleteOnClose)
            this.layoutState.addCloseHandler(panel.getID(), () =>
                this.removePanel(panel)
            );
    }

    /**
     * Shows the given panel
     * @param panel The panel to be shown
     */
    public showPanel(panel: PanelState) {
        const panels = this.layoutState.getAllTabPanels();
        const panelId =
            panels.find(p => p.tabs.some(({id}) => id == "root"))?.id ?? panels[0].id;
        this.layoutState.openTab(panelId, panel.getID());
        this.layoutState.selectTab(panelId, panel.getID());
    }

    /**
     * Removes the panel from the app
     * @param panel The panel to be removed
     * @param removeFromLayout Whether this panel should also be removed from the layout data
     */
    public removePanel(panel: PanelState, removeFromLayout: boolean = true): void {
        const current = {...this.panels.get()};
        if (!(panel.getID() in current)) return;
        delete current[panel.getID()];
        this.panels.set(current);

        // Close any tabs referencing this panel
        if (!removeFromLayout) return;
        for (let container of this.layoutState.getAllTabPanels())
            if (container.tabs.some(({id}) => id == panel.getID()))
                this.layoutState.closeTab(container.id, panel.getID());
    }

    /**
     * Retrieves all the currently opened panels
     * @param hook The hook to subscribe to changes
     * @returns The panel for the given ID
     */
    public getPanels(hook?: IDataHook): PanelState[] {
        return Object.values(this.panels.get(hook));
    }

    /**
     * Retrieves all the currently opened panels
     * @param id The id of the panel to retrieve
     * @param hook The hook to subscribe to changes
     * @returns The panel for the given ID
     */
    public getPanel(id: string, hook?: IDataHook): PanelState | null {
        return this.panels.get(hook)[id] ?? null;
    }

    /**
     * Retrieves the layout state
     * @returns The layout state
     */
    public getLayoutState(): LayoutState {
        return this.layoutState;
    }

    /**
     * Retrieves the UI for a panel with the given ID
     * @param id The ID of the panel to retrieve
     * @param components The component types to use for the panel
     * @param hook The hook to subscribe to changes
     * @returns The UI
     */
    public getPanelUI(
        id: string,
        components: IPanelComponents,
        onContext?: (panel: PanelState, event: MouseEvent) => void,
        hook?: IDataHook
    ): IContent {
        const panelState = this.getPanel(id, hook);
        if (!panelState) {
            const NotFoundComponent = components["none"];
            return {
                id,
                name: "Not found",
                content: NotFoundComponent ? <NotFoundComponent /> : <></>,
            };
        }

        const PanelComponent = components[panelState.stateType];
        if (!PanelComponent) {
            return {
                id,
                name: panelState.getName(hook),
                onTabContext: onContext && (e => onContext(panelState, e)),
                content: <></>,
                forceOpen: !panelState.canClose(hook),
            };
        }

        return {
            id,
            name: panelState.getName(hook),
            onTabContext: onContext && (e => onContext(panelState, e)),
            content: <PanelComponent state={this} panel={panelState} />,
            forceOpen: !panelState.canClose(hook),
        };
    }

    // value interactions
    /**
     * Opens the given value in a new panel
     * @param value The value to be opened
     * @param show Whether to show the new tab
     * @returns The state of the opened tab
     */
    public open(value: IVal, show: boolean = true): ValuePanelState | null {
        const map = this.valueNodesMap.get();
        if (!map) return null;

        const nodes = map.get(value);
        if (!nodes || nodes?.length == 0) return null;

        return this.openNode(nodes[0], show);
    }

    /**
     * Opens the value of the given node in a new panel
     * @param value The value to be opened
     * @param show Whether to show the new tab
     * @returns The state of the opened tab, or null if failed
     */
    public openNode(value: IValNode, show: boolean = true): ValuePanelState | null {
        const nodes = this.getNodes(value);
        if (!nodes) return null;

        const panelState = new ValuePanelState(nodes);
        this.addPanel(panelState, show);
        panelState.setName(getName(value.value));
        return panelState;
    }

    /**
     * Retrieves the nodes representing a given value
     * @param value The value to get the node for
     * @returns The value nodes, or null if the value isn't loaded
     */
    protected getNodes(value: IValNode): IValNode[] | null {
        const nodes = this.valueNodes.get();
        if (!nodes) return null;

        const index = nodes.findIndex(({id}) => value.id == id);
        if (index == -1) return null;

        const childNodes = nodes.slice(index + 1, index + 1 + value.range);
        const allNodes: IValNode[] = [
            {
                id: value.parent!,
                name: "",
                children: [value.id],
                parent: null,
                value: {type: "boolean", id: -1, value: false}, // Fake root value
                range: 0,
            },
            value,
            ...childNodes,
        ];
        return allNodes;
    }

    /**
     * Reveals the value in the UI
     * @param value The value to be revealed
     */
    public reveal(value: IVal | IEntry): void {
        const nodes = this.valueNodesMap.get()?.get(value);
        if (!nodes) return;
        this.revealNodes(nodes);
    }

    /**
     * Reveals the value in the UI
     * @param value The value to be revealed
     */
    public revealNodes(nodes: IValNode[]): void {
        const nodeSet = new Set<IValNode>();
        nodes.forEach(node => nodeSet.add(node));
        const tabContainers = this.layoutState.getAllTabPanels();
        Object.values(this.panels.get()).forEach(panel => {
            if (!(panel instanceof ValuePanelState)) return;
            if (panel.reveal(nodeSet)) {
                const container = tabContainers.find(c =>
                    c.tabs.find(tab => tab.id == panel.getID())
                );
                if (!container) return;
                this.layoutState.selectTab(container.id, panel.getID());
            }
        });
    }

    /**
     * Focuses on the specified value in the UI
     * @param value The value to focus the UI on
     */
    public focus(value: IVal | IEntry): void {}

    /**
     * Sets the given value to be highlighted in the UI
     * @param value The value to be highlighted
     */
    public setHighlight(value: IVal | IEntry | null): void {
        this.highlighting.set(value);
    }

    /**
     * Sets the given value to be hover highlighted in the UI
     * @param value The value to be hover highlighted
     */
    public setHoverHighlight(value: IVal | IEntry | null): void {
        this.hoverHighlighting.set(value);
    }

    /**
     * Retrieves the currently highlighted value
     * @param hook The hook to subscribe to changes
     * @returns The value to be highlighted
     */
    public getHighlight(hook?: IDataHook): IVal | IEntry | null {
        return this.highlighting.get(hook);
    }

    /**
     * Retrieves the currently hover highlighted value
     * @param hook The hook to subscribe to changes
     * @returns The value to be hover highlighted
     */
    public getHoverHighlight(hook?: IDataHook): IVal | IEntry | null {
        return this.hoverHighlighting.get(hook);
    }

    // Settings
    /**
     * Retrieves the settings
     * @param hook The hook to subscribe to changes
     * @returns The current settings
     */
    public getSettings(hook?: IDataHook): ISettings {
        return this.specialTabs.settings.getSettings(hook);
    }

    /**
     * Updates the settings of the application
     * @param settings The settings of the application
     */
    public updateSettings(settings: TDeepPartial<ISettings>): void {
        this.specialTabs.settings.updateSettings(settings);
    }

    /**
     * Retrieves the global settings
     * @param hook The hook to subscribe to changes
     * @returns The current global settings
     */
    public getGlobalSettings(hook?: IDataHook): IGlobalSettings {
        return this.specialTabs.settings.getGlobalSettings(hook);
    }

    /**
     * Updates the settings of the application
     * @param settings The settings of the application
     */
    public updateGlobalSettings(settings: TDeepPartial<IGlobalSettings>): void {
        this.specialTabs.settings.updateGlobalSettings(settings);
    }

    /**
     * Loads the profile data from disk
     */
    public loadProfilesData(): void {
        this.specialTabs.settings.loadProfilesData();
    }

    /**
     * Saves the current profile to disk
     */
    public saveProfile(): void {
        this.specialTabs.settings.saveProfile();
    }
}
