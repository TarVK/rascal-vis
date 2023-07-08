import {IValNode} from "../../../_types/IValNode";

export type ITabsValueData = ITabValueData[];
export type ITabValueData = {
    /** The name of the tab to open the value in */
    name: string;
    /** The tab to copy data from, if this tab doesn't exist yet */
    init?: string;
    /** The value to be opened */
    node: IValNode;
};
