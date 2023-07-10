/**
 * Retrieves the special constructor name according to a standardized naming scheme
 * @param name The camelcase basic name to be used
 * @returns The basic named transformed to be more unique
 */
export function getSpecialConstrName<T extends string>(name: T): `V${TFirstUpper<T>}` {
    return ("V" + name.substring(0, 1).toUpperCase() + name.substring(1)) as any;
}

type TFirstUpper<T extends string> = T extends `${infer K}${infer Y}`
    ? `${Uppercase<K>}${Y}`
    : Uppercase<T>;
