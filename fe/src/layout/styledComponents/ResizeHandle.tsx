import React, {FC} from "react";
import {IResizeHandleProps} from "../_types/props/IResizeHandleProps";

export const ResizeHandle: FC<IResizeHandleProps> = ({direction}) => (
    <div
        style={{
            width: direction == "horizontal" ? 10 : "100%",
            height: direction == "vertical" ? 10 : "100%",
        }}></div>
);
