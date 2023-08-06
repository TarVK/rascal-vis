import {IGraphNodePositions} from "./IGraphPositions";
import {IGraphView} from "./IGraphView";

export type IGraphValueSerialization = {
    type: "graph";
    view?: IGraphView;
    positions?: IGraphNodePositions;
};
