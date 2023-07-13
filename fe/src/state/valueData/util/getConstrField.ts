import {IConstr, IVal} from "../../../_types/IVal";
import {TGetType} from "../../../value/_types/TGetType";

/**
 * Retrieves the field value with the given name and type if it exists
 * @param constr The constructor to retrieve the value from
 * @param fieldName The name fo the field to obtain
 * @param type The type that the value of the field should have
 * @returns The value that was found, or null otherwise
 */
export function getConstrField<K extends IVal["type"]>(
    constr: IConstr,
    fieldName: string,
    type: K
): null | TGetType<K> {
    const match = constr.namedChildren.find(
        ({name, value}) => name == fieldName && value.type == type
    );
    if (match) return match.value as any;
    return null;
}

/**
 * Retrieves the field value with the given name and type if it exists
 * @param constr The constructor to retrieve the value from
 * @param fieldName The name fo the field to obtain
 * @returns The value that was found, or null otherwise
 */
export function getConstrValField(constr: IConstr, fieldName: string): null | IVal {
    const match = constr.namedChildren.find(({name}) => name == fieldName);
    if (match) return match.value as any;
    return null;
}
