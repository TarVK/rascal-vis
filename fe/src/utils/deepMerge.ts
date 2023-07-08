import {TDeepPartial} from "../state/_types/TDeepPartial";

/**
 * Merges two objects together, recursively
 * @param a
 * @param b
 * @returns The merged object
 */
export function merge<T extends Object>(
    a: TDeepPartial<T>,
    b: TDeepPartial<T>
): TDeepPartial<T> {
    if ("raw" in b) return b;
    return {
        ...a,
        ...Object.fromEntries(
            Object.entries(b).map(([key, val]) => {
                if (
                    key in a &&
                    typeof (a as any)[key] == "object" &&
                    typeof val == "object"
                )
                    return [key, merge((a as any)[key], val)];
                return [key, val];
            })
        ),
    };
}
