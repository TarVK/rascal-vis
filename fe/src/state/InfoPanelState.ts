import {PanelState} from "./PanelState";

export class InfoPanelState extends PanelState {
    public stateType = "info";

    public constructor() {
        super("info");
    }
}
