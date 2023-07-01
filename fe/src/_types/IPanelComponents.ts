import {FC} from "react";
import {PanelState} from "../state/PanelState";
import {IPanelProps} from "../state/_types/IPanelProps";

export type IPanelComponents = Record<string, FC<IPanelProps>> & {none?: FC};
