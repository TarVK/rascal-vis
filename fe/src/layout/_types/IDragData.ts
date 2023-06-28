import {IPoint} from "../../utils/_types/IPoint";

export type IDragData = {
    position: IPoint;
    offset: IPoint;
    preview: JSX.Element;
    targetId: string;
    removeFromPanelId?: string;
};
