import {IBasePanelSerialization} from "./IBasePanelSerialization";
import {ISettings} from "./ISettings";

export type ISettingsPanelSerialization = IBasePanelSerialization & {
    type: "settings";
    settings: ISettings;
    profile: string;
};
