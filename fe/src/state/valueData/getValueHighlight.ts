import {NodeId} from "react-accessible-treeview";
import {IBool, IEntry, IVal} from "../../_types/IVal";
import {IValNode} from "../../_types/IValNode";
import {nonNullFilter} from "../../utils/nonNullFilter";
import {IHighlightValueData} from "./_types/IHighlightValueData";

/**
 * Retrieves the highlighting/reveal data to load according to the input value
 * @param nodes The input nodes to extract the data from
 * @param nodesMap A map of all the nodes, indexed by id
 * @returns The highlighting data
 */
export function getValueHighlight(
    nodes: IValNode[],
    nodesMap: Map<NodeId, IValNode>
): IHighlightValueData {
    const highlightInputs = nodes
        .map(v => getHighlightInput(v, nodesMap))
        .filter(nonNullFilter);
    let highlight: IVal | undefined;
    const reveal: Set<IValNode> = new Set();
    const revealAll: Set<number> = new Set();
    for (let highlightData of highlightInputs) {
        if (highlightData.highlight) highlight = highlightData.node.value as IVal;
        if (highlightData.reveal) reveal.add(highlightData.node);
        if (highlightData.revealAll) revealAll.add(highlightData.node.value.id);
    }

    if (revealAll.size > 0)
        for (let node of nodes) if (revealAll.has(node.value.id)) reveal.add(node);

    return {
        highlight,
        expand: [...reveal],
    };
}

type IExtractedHighlightData = {
    node: IValNode;
    highlight?: boolean;
    reveal: boolean;
    revealAll?: boolean;
};
function getHighlightInput(
    node: IValNode,
    nodesMap: Map<NodeId, IValNode>
): null | IExtractedHighlightData {
    const value = node.value;
    if ("key" in value) return null;
    if (value.type != "constr") return null;
    if (value.name != "VShow") return null;
    if (value.children.length != 1) return null;

    const outNode = node.children.map(id => nodesMap.get(id)).filter(nonNullFilter)[0];
    if (!outNode) return null;

    const out: IExtractedHighlightData = {node: outNode, reveal: true};
    for (let k of ["highlight", "reveal", "revealAll"] as const) {
        const match = value.namedChildren.find(
            (v): v is {name: string; value: IBool} =>
                v.name == k && v.value.type == "boolean"
        );
        if (match) out[k] = match.value.value;
    }

    return out;
}
