import React, {FC} from "react";
import {IDropAreaProps} from "../_types/props/IDropAreaProps";

export const DropArea: FC<IDropAreaProps> = ({dragging, onDrop}) => (
    <div style={{position: "absolute"}}></div>
);
