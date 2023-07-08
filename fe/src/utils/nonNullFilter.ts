/**
 * A filter with correct type info to determine whether a given value is null or not
 * @param input The input to check null condition for
 * @returns Whether the input is not null
 */
export function nonNullFilter<T>(input: T | null): input is T {
    return input != null;
}
