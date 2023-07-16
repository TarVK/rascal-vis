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
        | {name: "layoutDeleteUnusedPanels"; value: IBool}
        | {name: "textHoverHighlightIntensity"; value: INum}
        | {name: "textHighlightIntensity"; value: INum}
        | {name: "textShowSetSize"; value: IBool}
        | {name: "textShowMapSize"; value: IBool}
        | {name: "textShowListSize"; value: IBool}
        | {name: "textShowTupleSize"; value: IBool}
        | {name: "graphSharpness"; value: INum}
        | {name: "searchInitialLoadCount"; value: INum}
        | {name: "searchExpandLoadCount"; value: INum}
        | {name: "grammarShowLayout"; value: IBool}
        | {name: "grammarAlignWidth"; value: INum}
        | {name: "grammarShowHandle"; value: IString}
    )[];
};
