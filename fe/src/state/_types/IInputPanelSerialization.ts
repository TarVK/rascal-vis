import {IBasePanelSerialization} from "./IBasePanelSerialization";

export type IInputPanelSerialization = IBasePanelSerialization & {
    address: string;
    pollInterval: number;
    textValue: string;
    selected: ISelectedInput;
};
export type ISelectedInput = "server" | "manual";
