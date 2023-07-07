import {FC} from "react";
import {ValuePanelState} from "../state/ValuePanelState";
import {IPanelProps} from "../state/_types/IPanelProps";

export type IPanelComponents = Record<string, FC<IPanelProps>> & {none?: FC};
