import {IVal} from "../../../_types/IVal";

/**
 * Attempts to extract the number out of number value
 * @param val The value to extract the number from
 * @returns Either the extracted number, or undefined
 */
export function getValNumber(
    val: IVal | null,
    {
        min = -Infinity,
        max = Infinity,
        decimals = undefined,
    }: {min?: number; max?: number; decimals?: number} = {}
): number | undefined {
    if (val?.type != "number") return undefined;
    const num = Number(val.value);
    if (isNaN(num)) return undefined;
    if (num < min) return min;
    if (num > max) return max;
    if (decimals != undefined) {
        const exp = Math.pow(10, decimals);
        return Math.round(num * exp) / exp;
    }
    return num;
}
