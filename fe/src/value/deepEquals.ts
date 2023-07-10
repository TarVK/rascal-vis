import {IVal} from "../_types/IVal";

/**
 * Checks whether val1 and val2 are equivalent, without relying on id or reference data
 * @param val1 The value1 to compare
 * @param val2 The value 2 to compare
 */
export function deepEquals(val1: IVal, val2: IVal): boolean {
    if (val1.type == "constr" || val1.type == "node") {
        if (val1.type != val2.type) return false;
        if (val1.name != val2.name) return false;
        if (
            val1.children.length != val2.children.length ||
            val1.namedChildren.length != val2.namedChildren.length
        )
            return false;

        const childrenEquals = val1.children.every((val, i) =>
            deepEquals(val, val2.children[i])
        );
        if (!childrenEquals) return false;

        const namedChildrenEquals = val1.namedChildren.every(({name, value}) =>
            val2.namedChildren.some(
                ({name: name2, value: value2}) =>
                    name == name2 && deepEquals(value, value2)
            )
        );
        if (!namedChildrenEquals) return false;

        return true;
    } else if (val1.type == "map") {
        if (val1.type != val2.type) return false;
        const namedChildrenEquals = val1.children.every(({key, value}) =>
            val2.children.some(
                ({key: key2, value: value2}) =>
                    deepEquals(key, key2) && deepEquals(value, value2)
            )
        );
        if (!namedChildrenEquals) return false;

        return true;
    } else if (val1.type == "list" || val1.type == "set" || val1.type == "tuple") {
        if (val1.type != val2.type) return false;
        if (val1.children.length != val2.children.length) return false;
        const childrenEquals = val1.children.every((val, i) =>
            deepEquals(val, val2.children[i])
        );
        if (!childrenEquals) return false;
        return true;
    } else if (val1.type == "boolean" || val1.type == "number") {
        if (val1.type != val2.type) return false;
        return val1.value == val2.value;
    } else if (val1.type == "location") {
        if (val1.type != val2.type) return false;
        if (val1.uri != val2.uri) return false;
        const equalPosition =
            !!val1.position == !!val2.position &&
            (!val1.position ||
                !val2.position ||
                (val1.position.start.line == val2.position.start.line &&
                    val1.position.start.column == val2.position.start.column &&
                    val1.position.end.line == val2.position.end.line &&
                    val1.position.end.column == val2.position.end.column &&
                    val1.position.offset.start == val2.position.offset.start &&
                    val1.position.offset.end == val2.position.offset.end));
        if (!equalPosition) return false;
        return true;
    } else {
        if (val1.type != val2.type) return false;
        return val1.valuePlain == val2.valuePlain;
    }
}
