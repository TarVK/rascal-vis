export type TDeepPartial<T extends Object> = {
    [K in keyof T]?: T[K] extends Object ? TDeepPartial<T[K]> : T[K];
};
