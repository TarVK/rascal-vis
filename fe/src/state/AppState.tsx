import React, {FC} from "react";
import {DataCacher, Field, IDataHook} from "model-react";
import {IVal, IValPlain} from "../_types/IVal";
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

/**
 * Representing all application state data
 */
export class AppState {
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
        if (valueNodes) {
            const fakeRoot: IValNode = {
                id: -1,
                name: "",
                children: [valueNodes[0].id],
                parent: null,
                value: {type: "boolean", id: -1, value: false},
                range: 0,
            };
            const firstNode = {
                ...valueNodes[0],
                parent: -1,
            };
            const basePanel = new PanelState([
                fakeRoot,
                firstNode,
                ...valueNodes.slice(1),
            ]);
            basePanel.setCanClose(false);
            basePanel.setName("Root");
            this.addPanel(basePanel);
            const panelId = this.layoutState.getAllTabPanelIDs()[0];
            this.layoutState.openTab(panelId, basePanel.getID());
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
            content: <PanelComponent panel={panelState} />,
            forceOpen: !panelState.canClose(hook),
        };
    }

    // value interactions
    /**
     * Reveals the value in the UI
     * @param value The value to be revealed
     */
    public reveal(value: IVal): void {}

    /**
     * Focuses on the specified value in the UI
     * @param value The value to focus the UI on
     */
    public focus(value: IVal): void {}

    /**
     * Sets the given value to be highlighted in the UI
     * @param value The value to be highlighted
     */
    public setHighlight(value: IVal | null): void {}

    /**
     * Sets the given value to be hover highlighted in the UI
     * @param value The value to be hover highlighted
     */
    public setHoverHighlight(value: IVal | null): void {}

    /**
     * Retrieves the currently highlighted value
     * @param hook The hook to subscribe to changes
     * @returns The value to be highlighted
     */
    public getHighlight(hook?: IDataHook): IVal | null {
        return null;
    }

    /**
     * Retrieves the currently hover highlighted value
     * @param hook The hook to subscribe to changes
     * @returns The value to be hover highlighted
     */
    public getHoverHighlight(hook?: IDataHook): IVal | null {
        return null;
    }
}
