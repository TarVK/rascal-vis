import {DataCacher, IDataHook} from "model-react";
import {BaseValueTypeState} from "./BaseValueTypeState";
import {IPlainValueSerialization} from "./_types/IPlainValueSerialization";
import {IGraphValueSerialization} from "./_types/IGraphValueSerialization";
import {getSpecialConstrName} from "../../value/getSpecialConstrName";
import {ISpecialConstrData} from "../../value/_types/ISpecialConstrData";
import {IGraphData, IGraphEdgeData, IGraphNodeData} from "./_types/IGraphData";
import {IGraphValueInput} from "./_types/IGraphValueInput";
import {getConstrField, getConstrValField} from "../valueData/util/getConstrField";
import {IValNode} from "../../_types/IValNode";
import {TPartialBy} from "../../utils/_types/TPartialBy";
import Color from "color";

/** Data about graph constructors */
export const graphConstrData = {
    name: getSpecialConstrName("graph"),
    type: "visualization",
} satisfies ISpecialConstrData;

/** Data about node constructors */
export const graphNodeConstrData = {
    name: getSpecialConstrName("node"),
    type: "visualizationSupport",
} satisfies ISpecialConstrData;

/** Data about node constructors */
export const graphEdgeConstrData = {
    name: getSpecialConstrName("edge"),
    type: "visualizationSupport",
} satisfies ISpecialConstrData;

/**
 * The data to represent graph values
 */
export class GraphValueState extends BaseValueTypeState {
    public type = "graph";
    public description = {name: "Graph", icon: "BranchMerge"};

    /** The current graph data, if the panel's value represents a graph */
    public graph = new DataCacher<null | IGraphData>(h => {
        const applicable = this.isApplicable(h);
        if (!applicable) return null;

        const value = this.panel.value.get(h);
        const nodes = this.panel.getValueNodes(h);
        return getGraphData(value as IGraphValueInput, nodes);
    });

    /** @override */
    public isApplicable(hook?: IDataHook): boolean {
        const value = this.panel.value.get(hook);
        return (
            value != null &&
            !("key" in value) &&
            value.type == "constr" &&
            value.name == graphConstrData.name &&
            value.children[0].type == "set" &&
            value.children[1].type == "set"
        );
    }

    /** @override */
    public serialize(): IGraphValueSerialization {
        return {
            type: "graph",
        };
    }

    /** @override */
    public deserialize(value: IGraphValueSerialization): void {}
}

/**
 * Extracts the graph data from a graph value input
 * @param input The input to extract the data from
 * @param sourceNodes The input nodes that to link with
 * @returns THe simpler graph data
 */
export function getGraphData(
    input: IGraphValueInput,
    sourceNodes: IValNode[]
): IGraphData {
    const highlightLightenFactor = 0.4;
    const undirected = getConstrField(input, "undirected", "boolean")?.value;
    const source = getConstrValField(input, "source") ?? undefined;
    const meta = getConstrValField(input, "meta") ?? undefined;
    const nodes = input.children[0].children
        .filter(node => node.type == "constr" && node.children.length == 1)
        .map<TPartialBy<IGraphNodeData, "nodeSource">>(node => {
            const color = getConstrField(node, "color", "string")?.valuePlain;
            return {
                id: node.children[0],
                nodeSource: sourceNodes.find(({value}) => value == node),
                name: getConstrField(node, "name", "string")?.valuePlain,
                color: color,
                highlightColor:
                    getConstrField(node, "highlightColor", "string")?.valuePlain ??
                    (color
                        ? Color(color).lighten(highlightLightenFactor).toString()
                        : undefined),
                source: getConstrValField(node, "source") ?? undefined,
                meta: getConstrValField(node, "meta") ?? undefined,
            };
        })
        .filter((v): v is IGraphNodeData => !!v.nodeSource);
    const edges = input.children[1].children
        .filter(edge => edge.type == "constr" && edge.children.length == 2)
        .map<TPartialBy<IGraphEdgeData, "nodeSource">>(edge => {
            const color = getConstrField(edge, "color", "string")?.valuePlain;
            return {
                id: edge,
                nodeSource: sourceNodes.find(({value}) => value == edge),
                start: edge.children[0],
                end: edge.children[1],
                undirected:
                    getConstrField(edge, "undirected", "boolean")?.value ?? undirected,
                name: getConstrField(edge, "name", "string")?.valuePlain,
                color: color,
                highlightColor:
                    getConstrField(edge, "highlightColor", "string")?.valuePlain ??
                    (color
                        ? Color(color).lighten(highlightLightenFactor).toString()
                        : undefined),
                source: getConstrValField(edge, "source") ?? undefined,
                meta: getConstrValField(edge, "meta") ?? undefined,
            };
        })
        .filter((v): v is IGraphEdgeData => !!v.nodeSource);
    return {
        nodes,
        edges,
        undirected,
        source,
        meta,
    };
}
