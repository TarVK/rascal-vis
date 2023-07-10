import {IVal} from "../_types/IVal";
import {IValMap} from "../_types/IValMap";
import {INodeRole, IValNode} from "../_types/IValNode";

/**
 * Creates the value nodes for a given value
 * @param value The value to obtain the nodes for
 * @returns The value nodes to represent this value in a tree view, as well as a map of values and
 */
export function createValueNodes(value: IVal): [IValNode[], IValMap] {
    const out: IValNode[] = [];
    const map: IValMap = new Map();
    createValueNodesRec(value, -1, null, out, map, "");
    // console.log(out);
    return [out, map];
}

/**
 * Creates values recursively
 * @param value The value to obtain the nodes for
 * @param parent The ID of the parent, or an empty string if no parent
 * @param role The node's role in relation to its parent
 * @param output The output list to add the nodes to
 * @param map The map of values and what nodes they are referenced in
 * @param ID The ID to be used for the node
 * @returns The created node
 */
function createValueNodesRec(
    value: IVal,
    parent: string | number,
    role: INodeRole | null,
    output: IValNode[],
    map: IValMap,
    ID: string
): IValNode {
    const namePrefix = getNamePrefix(role);
    const rec = (
        value: IVal,
        parentId: string,
        role: INodeRole | null,
        childId: string
    ) => createValueNodesRec(value, parentId, role, output, map, childId);

    const addNode = (node: IValNode) => {
        let nodes = map.get(node.value);
        if (!nodes) {
            nodes = [];
            map.set(node.value, nodes);
        }
        nodes.push(node);
        output.push(node);
    };
    const createNode = (name: string, isBranch: boolean): IValNode => ({
        id: ID,
        name: namePrefix + name,
        parent,
        value,
        children: [],
        range: 0,
        role,
        isBranch,
    });

    if (value.type == "constr" || value.type == "node") {
        const node: IValNode = createNode(value.name, true);
        addNode(node);

        const startLength = output.length;
        value.children.forEach((child, i) => {
            const childNode = rec(child, ID, {type: "index", index: i}, ID + "." + i);
            node.children.push(childNode.id);
        });
        const nameCount: Record<string, number> = {};
        value.namedChildren.forEach((child, i) => {
            const childID = (nameCount[child.name] ?? -1) + 1;
            nameCount[child.name] = childID;
            const childNode = rec(
                child.value,
                ID,
                {type: "name", name: child.name},
                ID + "." + child.name + (childID == 0 ? "" : childID)
            );
            node.children.push(childNode.id);
        });
        node.range = output.length - startLength;

        return node;
    } else if (value.type == "map") {
        const mapName = `map(${value.children.length})`;
        const node: IValNode = createNode(mapName, true);
        addNode(node);

        const startLength = output.length;
        let childID = 0;
        for (let entry of value.children) {
            const entryId = ID + "." + childID++;
            node.children.push(entryId);

            const entryNode: IValNode = {
                id: entryId,
                name: "",
                parent: ID,
                value: entry,
                children: [],
                range: 0,
                role: null,
            };
            addNode(entryNode);

            const startLength = output.length;
            const keyNode = rec(entry.key, entryId, {type: "key"}, entryId + ".key");
            const valueNode = rec(
                entry.value,
                entryId,
                {type: "value"},
                entryId + ".value"
            );
            entryNode.children.push(keyNode.id, valueNode.id);
            entryNode.name = keyNode.name.substring(getNamePrefix({type: "key"}).length);
            entryNode.range = output.length - startLength;
        }
        node.range = output.length - startLength;

        return node;
    } else if (value.type == "set" || value.type == "tuple" || value.type == "list") {
        const brackets =
            value.type == "set"
                ? {o: "{", c: "}"}
                : value.type == "tuple"
                ? {o: "<", c: ">"}
                : {o: "[", c: "]"};
        const name = value.type + brackets.o + value.children.length + brackets.c;
        const node: IValNode = createNode(name, true);
        addNode(node);

        const startLength = output.length;
        value.children.forEach((child, i) => {
            const childNode = rec(child, ID, {type: "index", index: i}, ID + "." + i);
            node.children.push(childNode.id);
        });
        node.range = output.length - startLength;

        return node;
    } else {
        const name =
            value.type == "location"
                ? value.uri
                : value.type == "string"
                ? value.value
                      .map(s => (typeof s == "string" ? s : `\\${s.text}`))
                      .join("")
                : value.value + "";
        const node: IValNode = createNode(name, false);
        addNode(node);

        return node;
    }
}

const getNamePrefix = (role: INodeRole | null) =>
    role == null
        ? ""
        : role.type == "key"
        ? "key: "
        : role.type == "value"
        ? "value: "
        : role.type == "index"
        ? role.index + ": "
        : role.name + ": ";
