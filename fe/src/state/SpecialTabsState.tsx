import {AppState} from "./AppState";
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
    public layout: LayoutPanelState;
    public settings: SettingsState;

    public tabs: {icon: string; name: string; panel: PanelState}[] = [];

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

        this.layout = new LayoutPanelState(state);
        this.layout.setName("Tabs");
        this.appState.addPanel(this.layout, false, false);

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
                panel: this.search,
            },
            {
                icon: "search",
                name: this.search.getName(),
                panel: this.search,
            },
            {
                icon: "LargeGrid",
                name: this.layout.getName(),
                panel: this.layout,
            },
            {
                icon: "Settings",
                name: this.settings.getName(),
                panel: this.settings,
            },
        ];
    }

    /**
     * Opens the given state
     * @param panel The panel state
     */
    public open(panel: PanelState): void {
        const layout = this.appState.getLayoutState();
        const containers = layout.getAllTabPanels();
        const container = containers.find(container =>
            container.tabs.some(({id}) => id == panel.getID())
        );
        if (container) {
            layout.selectTab(container.id, panel.getID());
        } else {
            const sidebarID = "sidebar";
            const sidebar = containers.find(({id}) => id == sidebarID);
            if (!sidebar) {
                const mainId = layout.getLayout().id;
                const parentId = layout.addPanel(mainId, "west", 0.6, sidebarID);
                if (!parentId) return;
            }
            layout.openTab(sidebarID, panel.getID());
            layout.selectTab(sidebarID, panel.getID());
        }
    }
}
