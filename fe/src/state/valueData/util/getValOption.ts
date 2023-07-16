import { IVal } from "../../../_types/IVal";

/**
 * Attempts to extract one of the given options from the value
 * @param val The value to extract the option from
 * @param options The valid options
 * @param def The default option if extraction failed
 * @returns The option
 */
export function getValOption<T>(val: IVal|null, options: T[], def: T): T {
    if(val?.type!="string") return def;
    const text = val.valuePlain;
    if(options.includes(text as any)) return text as any;
    return def;    
}