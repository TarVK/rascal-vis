import {IVal} from "../../../_types/IVal";

export type IHoverHandlers = (value: IVal) => {
    onEnter: () => void;
    onLeave: () => void;
};
