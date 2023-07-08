import {IVal} from "../_types/IVal";

/**
 * Converts the node AST to a string
 * @param node The node to get
 * @returns The string
 */
export function ASTtoText(node: IVal): string {
    if (node.type == "boolean") return node.value + "";
    if (node.type == "number") return node.value;
    if (node.type == "string")
        return (
            '"' +
            node.value.map(val => (typeof val == "string" ? val : val.text)).join("") +
            '"'
        );
    if (node.type == "location")
        return (
            "|" +
            node.uri +
            "|" +
            (node.position
                ? `(${node.position.offset.start}, ${node.position.offset.end}, <${node.position.start.line}, ${node.position.start.column}>, <${node.position.end.line}, ${node.position.end.column}>)`
                : "")
        );
    if (node.type == "constr" || node.type == "node")
        return (
            (node.type == "constr" ? node.name : `"${node.name}"`) +
            "(" +
            [
                ...node.children.map(ASTtoText),
                ...node.namedChildren.map(
                    ({name, value}) => name + "=" + ASTtoText(value)
                ),
            ].join(",") +
            ")"
        );
    if (node.type == "list") return "[" + node.children.map(ASTtoText).join(",") + "]";
    if (node.type == "set") return "{" + node.children.map(ASTtoText).join(",") + "}";
    if (node.type == "tuple") return "<" + node.children.map(ASTtoText).join(",") + ">";
    if (node.type == "map")
        return (
            "(" +
            node.children
                .map(({key, value}) => ASTtoText(key) + ":" + ASTtoText(value))
                .join(",") +
            ")"
        );
    return "";
}
