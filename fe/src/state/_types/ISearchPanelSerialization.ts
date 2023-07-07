import {IBasePanelSerialization} from "./IBasePanelSerialization";

export type ISearchPanelSerialization = IBasePanelSerialization & {
    type: "search";
    search: string;
    searchType: "text" | "value";
};
