import {IEntry, IVal} from "./IVal";
import {IValNode} from "./IValNode";

/** A map of values and the nodes where these values are referenced */
export type IValMap = Map<IVal | IEntry, IValNode[]>;
