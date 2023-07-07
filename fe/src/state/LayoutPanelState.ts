import {IDataHook} from "model-react";
import {AppState} from "./AppState";
import {PanelState} from "./PanelState";

/** A state to manage all panels, including hidden ones */
export class LayoutPanelState extends PanelState {
    public stateType = "layout";

    protected state: AppState;

    public constructor(state: AppState) {
        super("layout");
        this.state = state;
    }

    /**
     * Retrieves all the available panels
     * @param hook The hook to subscribe to changes
     * @returns The current panels
     */
    public getPanels(hook?: IDataHook): PanelState[] {
        return this.state.getPanels(hook);
    }
}
