import {IBool, IConstr, IVal} from "../../../_types/IVal";
import {highlightConstrData} from "../getValueHighlight";

// prettier-ignore
export type IHighlightValueDataInput = Omit<IConstr, "namedChildren"> & {
    name: typeof highlightConstrData["name"];
    children: [IVal];
    namedChildren: (
        /** Whether to visually highlight this value within all visualizations */
        | {name: "highlight"; value: IBool}
        /** Whether to reveal this particular instance of the value */
        | {name: "reveal"; value: IBool}
        /** Whether to reveal all instances of the value */
        | {name: "revealAll"; value: IBool}
    )[];
};
