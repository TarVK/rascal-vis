import {IBasePanelSerialization} from "./IBasePanelSerialization";

export type IValuePanelSerialization = IBasePanelSerialization & {
    selectedType: string;
    types: {type: string}[];
};
