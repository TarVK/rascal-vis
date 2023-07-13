import {IEntry, IVal} from "../../../../_types/IVal";

export type IHoverHandlers = (value: IVal | IEntry) => {
    onEnter: () => void;
    onLeave: () => void;
};
