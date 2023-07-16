import { MouseEvent } from "react";
import { IValNode } from "../../../../_types/IValNode";

export type IGrammarExpansionData = {
    expanded: Set<string|number>;
    toggleHandler: (value: IValNode)=>(event: MouseEvent)=>void;
}