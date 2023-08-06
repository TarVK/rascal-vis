/** @jsx svg */
import {svg} from "sprotty/lib/lib/jsx";
import {injectable, inject} from "inversify";
import {VNode} from "snabbdom";
import {
    EdgeRouterRegistry,
    IView,
    IViewArgs,
    Point,
    RenderingContext,
    RoutableView,
    SEdge,
    SNode,
} from "sprotty";
import {NodeModel} from "./NodeModel";
import {EdgeModel} from "./EdgeModel";
import {Edge} from "vis-network";

@injectable()
export class EdgeView extends RoutableView {
    @inject(EdgeRouterRegistry) edgeRouterRegistry: EdgeRouterRegistry;

    render(
        edge: Readonly<EdgeModel & SEdge>,
        context: RenderingContext,
        args?: IViewArgs
    ): VNode | undefined {
        const route = this.edgeRouterRegistry.route(edge, args);
        if (route.length === 0) {
            return this.renderDanglingEdge("Cannot compute route", edge, context);
        }
        if (!this.isVisible(edge, route, context)) {
            if (edge.children.length === 0) {
                return undefined;
            }

            // The children of an edge are not necessarily inside the bounding box of the route,
            // so we need to render a group to ensure the children have a chance to be rendered.
            return (<g>{context.renderChildren(edge, {route})}</g>) as any;
        }

        return (
            <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
                {this.renderLine(edge, route, context, args)}
                {this.renderAdditionals(edge, route, context)}
                {context.renderChildren(edge, {route})}
            </g>
        ) as any;
    }

    arrowSize = 7;
    protected renderLine(
        edge: EdgeModel,
        segments: Point[],
        context: RenderingContext,
        args?: IViewArgs
    ): VNode {
        const firstPoint = segments[0];

        const prevLast = segments[segments.length - 2];
        const last = segments[segments.length - 1];
        const arrow = edge.directed && last && prevLast;

        let path = `M ${firstPoint.x},${firstPoint.y}`;
        for (let i = 1; i < segments.length - (arrow ? 1 : 0); i++) {
            const p = segments[i];
            path += ` L ${p.x},${p.y}`;
        }

        if (arrow) {
            const dx = last.x - prevLast.x;
            const dy = last.y - prevLast.y;
            const l = Math.sqrt(dx * dx + dy * dy);
            const frac = this.arrowSize / l;

            path += ` L ${last.x - dx * frac},${last.y - dy * frac}`;
        }

        return (<path d={path} />) as any;
    }

    protected renderAdditionals(
        edge: EdgeModel,
        segments: Point[],
        context: RenderingContext
    ): VNode[] {
        if (edge.directed) {
            const last = segments[segments.length - 1];
            const sLast = segments[segments.length - 2];
            if (!last || !sLast) return [];

            const dx = last.x - sLast.x;
            const dy = last.y - sLast.y;
            const angle = (Math.atan2(dy, dx) / Math.PI) * 180;
            const s = this.arrowSize;
            return (
                <polygon
                    points={`0,0 -${s},${s} -${s},-${s}`}
                    transform={`translate(${last.x}, ${last.y}) rotate(${angle} 0 0)`}
                />
            ) as any;
        }
        return [];
    }

    protected renderDanglingEdge(
        message: string,
        edge: EdgeModel,
        context: RenderingContext
    ): VNode {
        return (<text class-sprotty-edge-dangling={true}>?</text>) as any;
    }
}
