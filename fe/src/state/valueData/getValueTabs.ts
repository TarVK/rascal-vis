import {NodeId} from "react-accessible-treeview";
import {IValNode} from "../../_types/IValNode";
import {merge} from "../../utils/deepMerge";
import {nonNullFilter} from "../../utils/nonNullFilter";
import {ISettings} from "../_types/ISettings";
import {TDeepPartial} from "../_types/TDeepPartial";
import {IProfileValueData} from "./_types/IProfileValueData";
import {ITabValueData, ITabsValueData} from "./_types/ITabValueData";
import {getConstrField} from "./util/getConstrField";
import {getValNumber} from "./util/getValNumber";
import {specialConstructors} from "../../value/specialConstructors";
import {getSpecialConstrName} from "../../value/getSpecialConstrName";
import {ISpecialConstrData} from "../../value/_types/ISpecialConstrData";

/** Data about tab constructors */
export const tabConstrData = {
    name: getSpecialConstrName("tab"),
    type: "siteControls",
} satisfies ISpecialConstrData;

/**
 * Retrieves the tabs data to load according tot he input value
 * @param nodes The input nodes to extract the data from
 * @param nodesMap A map of all the nodes, indexed by id
 * @returns The tabs data
 */
export function getValueTabs(
    nodes: IValNode[],
    nodesMap: Map<NodeId, IValNode>
): ITabsValueData {
    return nodes.map(v => getTabsInput(v, nodesMap)).filter(nonNullFilter);
}

function getTabsInput(
    node: IValNode,
    nodesMap: Map<NodeId, IValNode>
): null | ITabValueData {
    const value = node.value;
    if ("key" in value) return null;
    if (value.type != "constr") return null;
    if (value.name != tabConstrData.name) return null;

    const name = getConstrField(value, "name", "string")?.valuePlain;
    if (!name) return null;

    const outNode = node.children.map(id => nodesMap.get(id)).filter(nonNullFilter)[0];
    if (!outNode) return null;

    const init = getConstrField(value, "init", "string")?.valuePlain;
    return {
        name,
        init,
        node: outNode,
    };
}
