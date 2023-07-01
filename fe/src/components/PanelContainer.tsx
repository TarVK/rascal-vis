import React, {FC} from "react";
import {useScrollbarStyle} from "../utils/useScrollbarStyle";
import {css} from "@emotion/css";

/** Standard styling for the panel contents container */
export const PanelContainer: FC<{className?: string}> = ({className, children}) => {
    const scrollbarStyle = useScrollbarStyle();
    return (
        <div
            className={`${css({
                padding: 10,
                boxSizing: "border-box",
                height: "100%",
                overflow: "auto",
                ...scrollbarStyle,
            })} ${className}`}>
            {children}
        </div>
    );
};
