import {SNode} from "sprotty-protocol";

export interface NodeModel extends SNode {
    name: string;
    color?: string;
}
