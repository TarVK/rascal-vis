import {FC} from "react";
import {IEntry, IVal} from "../../../_types/IVal";
import {IHighlight} from "./IHighlight";
import {IHoverHandlers} from "./IHoverHandler";

export type IHighlightCache = (
    value: IVal | IEntry,
    maxLength: number,
    hoverHandlers?: IHoverHandlers
) => IHighlight;
