import {highlightConstrData} from "../state/valueData/getValueHighlight";
import {profileConstrData, settingsConstrData} from "../state/valueData/getValueProfile";
import {tabConstrData} from "../state/valueData/getValueTabs";
import {
    graphConstrData,
    graphEdgeConstrData,
    graphNodeConstrData,
} from "../state/valueTypes/GraphValueState";
import {ISpecialConstrData} from "./_types/ISpecialConstrData";

/** Data about special constructors that have special meaning in our visualization tool */
export const specialConstructors: ISpecialConstrData[] = [
    highlightConstrData,
    profileConstrData,
    settingsConstrData,
    tabConstrData,
    graphConstrData,
    graphNodeConstrData,
    graphEdgeConstrData,
    {
        name: "grammar",
        type: "visualization"
    }
];
export type ISpecialConstr = typeof specialConstructors;

export const siteControlsContructorNames = Object.values(specialConstructors)
    .filter(({type}) => type == "siteControls")
    .map(({name}) => name as string);

export const visualizationContructorNames = Object.values(specialConstructors)
    .filter(({type}) => type == "visualization")
    .map(({name}) => name as string);
