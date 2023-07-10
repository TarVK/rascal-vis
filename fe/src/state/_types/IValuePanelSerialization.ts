import {NodeId} from "react-accessible-treeview";
import {IBasePanelSerialization} from "./IBasePanelSerialization";

export type IValuePanelSerialization = IBasePanelSerialization & {
    sourceNodeId: NodeId;
    selectedType: string;
    types: {type: string}[];
};
