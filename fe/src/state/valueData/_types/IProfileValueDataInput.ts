import {IBool, IConstr, INum, IString, IVal} from "../../../_types/IVal";
import {profileConstrData, settingsConstrData} from "../getValueProfile";

// prettier-ignore
export type IHighlightValueDataInput = Omit<IConstr, "namedChildren"> & {
    name: typeof profileConstrData["name"];
    namedChildren: (
        /** The name of the profile to select */
        | {name: "name"; value: IString}
        /** The name of the profile to copy */
        | {name: "init"; value: IString}
        /** The settings to be updated in this profile */
        | {name: "settings"; value: ISettingsValueDataInput}
    )[];
};

export type ISettingsValueDataInput = IConstr & {
    name: (typeof settingsConstrData)["name"];
    children: [];
    namedChildren: (
        | {name: "hoverHighlightIntensity"; value: INum}
        | {name: "highlightIntensity"; value: INum}
        | {name: "showSetSize"; value: IBool}
        | {name: "showMapSize"; value: IBool}
        | {name: "showListSize"; value: IBool}
        | {name: "showTupleSize"; value: IBool}
        | {name: "initialSearchLoadCount"; value: INum}
        | {name: "expandSearchLoadCount"; value: INum}
        | {name: "deleteUnusedPanels"; value: IBool}
    )[];
};
