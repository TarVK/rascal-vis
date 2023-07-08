import {FC} from "react";
import {IEntry, IVal} from "../../../../_types/IVal";
import {IHighlight} from "./IHighlight";
import {IHoverHandlers} from "./IHoverHandler";
import {IHighlightSettings} from "./IHighlightSettings";

export type IHighlightCache = (
    value: IVal | IEntry,
    maxLength: number,
    settings: IHighlightSettings,
    hoverHandlers?: IHoverHandlers
) => IHighlight;
