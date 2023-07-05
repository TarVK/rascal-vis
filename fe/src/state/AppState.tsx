import React, {FC} from "react";
import {DataCacher, Field, IDataHook} from "model-react";
import {IEntry, IVal, IValPlain} from "../_types/IVal";
import {value} from "../parse/parser";
import {Failure, Result} from "parsimmon";
import {dataAddress} from "../dataAddress";
import {fixReferences} from "../parse/fixReferences";
import {PanelState} from "./PanelState";
import {LayoutState} from "../layout/LayoutState";
import {IContent} from "../layout/_types/IContentGetter";
import {IPanelComponents} from "../_types/IPanelComponents";
import {createValueNodes} from "../parse/createValueNodes";
import {IValNode} from "../_types/IValNode";
import {IValMap} from "../_types/IValMap";
import {INode} from "react-accessible-treeview";
import {getName} from "../parse/getName";

/**
 * Representing all application state data
 */
export class AppState {
    protected highlighting = new Field<IVal | null>(null);
    protected hoverHighlighting = new Field<IVal | null>(null);

    protected valueText = new Field<null | string>(null);
    protected parseData = new DataCacher<null | Result<IValPlain>>(h => {
        const text = this.valueText.get(h);
        if (text == null) return null;
        return value.parse(text);
    });

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
     * Tries to load the latest value from the server
     */
    public async loadValue(): Promise<void> {
        try {
            const dataResponse = await fetch(dataAddress);
            const dataText = await dataResponse.text();
            if (this.valueText.get() != dataText) this.setValueText(dataText);
        } catch {
            this.valueText.set(null);
        }
    }

    /**
     * Sets the value text
     * @param text The text to be used
     */
    public setValueText(text: string): void {
        this.valueText.set(text);
        const valueNodes = this.valueNodes.get();
        if (valueNodes && valueNodes.length > 0) {
            const basePanel = this.openNode(valueNodes[0]);
            if (!basePanel) return;
            basePanel.setCanClose(false);
            basePanel.setName("Root");
        }
    }

    // Layout data
    protected panels = new Field<Record<string, PanelState>>({});
    protected layoutState = new LayoutState();

    /**
     * Adds a panel to the app
     * @param panel The panel to be added
     */
    public addPanel(panel: PanelState): void {
        const current = this.panels.get();
        this.panels.set({
            ...current,
            [panel.getID()]: panel,
        });
    }

    /**
     * Removes the panel from the app
     * @param panel The panel to be removed
     */
    public removePanel(panel: PanelState): void {
        const current = {...this.panels.get()};
        delete current[panel.getID()];
        this.panels.set(current);
    }

    /**
     * Removes all panels that are not in the list of panels
     * @param ids The ids of panels to keep
     */
    public filterPanels(ids: string[]): void {
        this.panels.set(
            Object.fromEntries(
                Object.entries(this.panels.get()).filter(([key]) => ids.includes(key))
            )
        );
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
                content: <></>,
                forceOpen: !panelState.canClose(hook),
            };
        }

        return {
            id,
            name: panelState.getName(hook),
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
    public open(value: IVal, show: boolean = true): PanelState | null {
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
    public openNode(value: IValNode, show: boolean = true): PanelState | null {
        const nodes = this.valueNodes.get();
        if (!nodes) return null;

        const index = nodes.indexOf(value);
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
        const panelState = new PanelState(allNodes);
        this.addPanel(panelState);
        panelState.setName(getName(value.value));
        if (show) {
            const panelId = this.layoutState.getAllTabPanelIDs()[0];
            this.layoutState.openTab(panelId, panelState.getID());
            this.layoutState.selectTab(panelId, panelState.getID());
        }
        return panelState;
    }

    /**
     * Reveals the value in the UI
     * @param value The value to be revealed
     */
    public reveal(value: IVal | IEntry): void {
        Object.values(this.panels.get()).forEach(panel => panel.reveal(value));
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
    public setHighlight(value: IVal | null): void {
        this.highlighting.set(value);
    }

    /**
     * Sets the given value to be hover highlighted in the UI
     * @param value The value to be hover highlighted
     */
    public setHoverHighlight(value: IVal | null): void {
        this.hoverHighlighting.set(value);
    }

    /**
     * Retrieves the currently highlighted value
     * @param hook The hook to subscribe to changes
     * @returns The value to be highlighted
     */
    public getHighlight(hook?: IDataHook): IVal | null {
        return this.highlighting.get(hook);
    }

    /**
     * Retrieves the currently hover highlighted value
     * @param hook The hook to subscribe to changes
     * @returns The value to be hover highlighted
     */
    public getHoverHighlight(hook?: IDataHook): IVal | null {
        return this.hoverHighlighting.get(hook);
    }
}
