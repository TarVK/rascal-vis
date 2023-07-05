import React, {FC, ReactNode, forwardRef} from "react";
import {useScrollbarStyle} from "../utils/useScrollbarStyle";
import {css} from "@emotion/css";

/** Standard styling for the panel contents container */
export const PanelContainer = forwardRef<
    HTMLDivElement,
    {className?: string; children: ReactNode}
>(({className, children}, ref) => {
    const scrollbarStyle = useScrollbarStyle();
    return (
        <div
            ref={ref}
            className={`${css({
                padding: 10,
                boxSizing: "border-box",
                height: "100%",
                width: "100%",
                overflow: "auto",
                ...scrollbarStyle,
            })} ${className}`}>
            {children}
        </div>
    );
});
