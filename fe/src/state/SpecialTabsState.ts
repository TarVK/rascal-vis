import {IDataHook} from "model-react";
import {AppState} from "./AppState";
import {InfoPanelState} from "./InfoPanelState";
import {InputPanelState} from "./InputPanelstate";
import {LayoutPanelState} from "./LayoutPanelState";
import {PanelState} from "./PanelState";
import {SearchPanelState} from "./SearchPanelState";
import {SettingsState} from "./SettingsState";
import {ValuePanelState} from "./ValuePanelState";

/**
 * A state to manage all special tabs
 */
export class SpecialTabsState {
    protected appState: AppState;

    public root: ValuePanelState;
    public search: SearchPanelState;
    public input: InputPanelState;
    // public layout: LayoutPanelState;
    public settings: SettingsState;
    public info: InfoPanelState;

    public tabs: {icon: string; name: string; panel: PanelState; openIn?: string}[] = [];

    public constructor(state: AppState) {
        this.appState = state;

        this.root = new ValuePanelState([]);
        (this.root as any).id = "root";
        this.root.setName("Root");
        this.root.setCanClose(false);
        this.appState.addPanel(this.root, true, false);

        this.search = new SearchPanelState(state);
        this.search.setName("Search");
        this.appState.addPanel(this.search, false, false);

        this.input = new InputPanelState(state);
        this.input.setName("Input");
        this.appState.addPanel(this.input, false, false);

        // this.layout = new LayoutPanelState(state);
        // this.layout.setName("Tabs");
        // this.appState.addPanel(this.layout, false, false);

        this.info = new InfoPanelState();
        this.info.setName("Info");
        this.appState.addPanel(this.info, false, false);

        this.settings = new SettingsState(state);
        this.settings.setName("Settings");
        this.appState.addPanel(this.settings, false, false);

        this.tabs = [
            {
                icon: "BulletedTreeList",
                name: this.root.getName(),
                panel: this.root,
            },
            {
                icon: "Info",
                name: "Info",
                panel: this.info,
                openIn: "root",
            },
            {
                icon: "FileCode", // OfflineStorage
                name: "Source",
                panel: this.input,
            },
            {
                icon: "search",
                name: this.search.getName(),
                panel: this.search,
            },
            {
                icon: "Settings",
                name: this.settings.getName(),
                panel: this.settings,
            },
        ];
    }

    /**
     * Opens the given panel
     * @param panel The panel state
     */
    public open(panel: PanelState): void {
        const layout = this.appState.getLayoutState();
        const containers = layout.getAllTabPanels();
        const panelID = panel.getID();
        const container = containers.find(container =>
            container.tabs.some(({id}) => id == panelID)
        );
        if (container) {
            layout.selectTab(container.id, panelID);
        } else {
            let targetContainerID = "sidebar";

            // Search for the panel id to open in
            const data = this.tabs.find(({panel: p}) => p == panel);
            if (data?.openIn) {
                const isContainer = containers.some(({id}) => id == data.openIn);
                if (isContainer) targetContainerID = data.openIn;
                else {
                    const container = containers.find(({tabs}) =>
                        tabs.some(({id}) => id == data.openIn)
                    );
                    if (container) targetContainerID = container.id;
                }
            }

            //Open in the panel
            const targetContainer = containers.find(({id}) => id == targetContainerID);
            if (!targetContainer) {
                const mainId = layout.getLayout().id;
                const parentId = layout.addPanel(mainId, "west", 0.6, targetContainerID);
                if (!parentId) return;
            }
            layout.openTab(targetContainerID, panelID);
            layout.selectTab(targetContainerID, panelID);
        }
    }

    /**
     * Closes the given panel
     * @param panel The panel state to close
     */
    public close(panel: PanelState): void {
        if (!panel.canClose()) return;

        const layout = this.appState.getLayoutState();
        const containers = layout.getAllTabPanels();
        const panelID = panel.getID();
        const parent = containers.find(({tabs}) => tabs.some(({id}) => id == panelID));
        if (parent) {
            layout.closeTab(parent.id, panelID);
        }
    }

    /**
     * Checks whether the given panel is opened
     * @param panel The panel to check the opened state for
     * @param hook The hook to subscribe to changes
     * @returns Whether the panel is opened currently
     */
    public isOpen(panel: PanelState, hook?: IDataHook): boolean {
        const layout = this.appState.getLayoutState();
        const containers = layout.getAllTabPanels(hook);
        const panelID = panel.getID();
        return containers.some(({tabs}) => tabs.some(({id}) => id == panelID));
    }

    /**
     * Checks whether the given panel is visible (opened and selected)
     * @param panel The panel to check the visibility state for
     * @param hook The hook to subscribe to changes
     * @returns Whether the panel is visible currently
     */
    public isVisible(panel: PanelState, hook?: IDataHook): boolean {
        const layout = this.appState.getLayoutState();
        const containers = layout.getAllTabPanels(hook);
        const panelID = panel.getID();
        return containers.some(({selected}) => selected == panelID);
    }
}
