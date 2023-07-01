import {IEntry, IVal} from "../_types/IVal";

/**
 * Retrieves the name for a given value
 * @param value The value to get the name for
 * @param length The target length to not go above (if possible)
 * @returns The name for the value
 */
export function getName(value: IVal | IEntry, length: number = 20): string {
    if ("key" in value) {
        const key = getName(value.key, Math.floor(length / 2));
        const val = getName(value.value, length - key.length - 2);
        return `${key}: ${val}`;
    } else if (value.type == "node" || value.type == "constr") return value.name;
    else if (value.type == "map") return `(${value.children.length})(...)`;
    else if (value.type == "list") return `(${value.children.length})[...]`;
    else if (value.type == "set") return `(${value.children.length}){...}`;
    else if (value.type == "tuple") return `(${value.children.length})<...>`;
    else if (value.type == "boolean" || value.type == "number") return `${value.value}`;
    else if (value.type == "string") {
        const text = value.value.reduce<string>(
            (t, v) => t + (typeof v == "string" ? v : `\\${v.text}`),
            ""
        );
        if (text.length > length) {
            const charCount = length - 3;
            const prefixLength = Math.floor(charCount / 2);
            const suffixLength = charCount - prefixLength;
            return (
                text.substring(0, prefixLength) +
                "..." +
                text.substr(text.length - suffixLength, suffixLength)
            );
        }
    } else if (value.type == "location")
        return `|${value.uri}|${
            value.position
                ? `(${value.position.offset.start},${value.position.offset.end},<${value.position.start.line},${value.position.start.column}>,<${value.position.end.line},${value.position.end.column}>)`
                : ""
        }`;
    return "";
}
