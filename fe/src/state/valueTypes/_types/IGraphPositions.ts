import {IVal} from "../../../_types/IVal";

export type IGraphPositions = IGraphPosition[];
export type IGraphPosition = {
    id: IVal;
    position: {x: number; y: number};
};
