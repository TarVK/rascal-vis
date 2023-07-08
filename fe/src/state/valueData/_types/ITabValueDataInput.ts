import {IBool, IConstr, INum, IString, IVal} from "../../../_types/IVal";

// prettier-ignore
export type IHighlightValueDataInput = IConstr & {
    name: "VTab";
    children: [IVal];
    namedChildren: (
        /** The name of the tab to open the value in */
        | {name: "name"; value: IString}
        /** The name of the tab to copy the data from if this tab doesn't exist yet */
        | {name: "init"; value: IString}
    )[];
};
