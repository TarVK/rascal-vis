import {FC} from "react";
import {PanelState} from "../state/PanelState";

export type IPanelComponents = Record<string, FC<{panel: PanelState}>> & {none?: FC};
