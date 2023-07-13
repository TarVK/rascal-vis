import {MouseEvent} from "react";
import {IVal} from "../../../../_types/IVal";
import {IValNode} from "../../../../_types/IValNode";
import {
    ICharRange,
    IGrammarCondition,
    IGrammarProduction,
    IGrammarSymbol,
} from "../../../../state/valueTypes/_types/IGrammarData";

export type IGrammarInteractionHandler = (
    value: IValNode,
    data: IGrammarClickData
) => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: (event: MouseEvent) => void;
    onContextMenu: (event: MouseEvent) => void;
};

export type IGrammarClickData =
    | IGrammarSymbol
    | IGrammarProduction
    | IGrammarCondition
    | ICharRange;
