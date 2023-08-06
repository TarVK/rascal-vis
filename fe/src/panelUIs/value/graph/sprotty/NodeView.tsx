/** @jsx svg */
import {svg} from "sprotty/lib/lib/jsx";
import {injectable} from "inversify";
import {VNode} from "snabbdom";
import {IView, RenderingContext, SNode} from "sprotty";
import {NodeModel} from "./NodeModel";
import {css} from "@emotion/css";

@injectable()
export class NodeView implements IView {
    render(node: Readonly<SNode & NodeModel>, context: RenderingContext): VNode {
        return (
            <g>
                <rect
                    style={{fill: node.color}}
                    class-node={true}
                    width={node.size.width}
                    height={node.size.height}></rect>
                <text x={node.size.width / 2} y={node.size.height / 2}>
                    {node.name}
                </text>
            </g>
        ) as any;
    }
}
