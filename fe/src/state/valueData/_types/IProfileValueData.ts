import {ISettings} from "../../_types/ISettings";
import {TDeepPartial} from "../../_types/TDeepPartial";

export type IProfileValueData = {
    /** The settings profile to select */
    selected?: string;
    /** The settings profile to copy, if the specified profile doesn't exist yet */
    init?: string;
    /** Settings to update */
    update?: TDeepPartial<ISettings>;
};
