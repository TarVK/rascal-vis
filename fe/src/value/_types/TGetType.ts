import {IVal} from "../../_types/IVal";

export type TGetType<N extends IVal["type"]> = [IVal] extends [infer U]
    ? U extends IVal
        ? U["type"] extends N
            ? U
            : never
        : never
    : never;
