import React, {FC} from "react";
import {ITabsContainerProps} from "../_types/props/ITabsContainerProps";
import {css} from "@emotion/css";

export const TabsContainer: FC<ITabsContainerProps> = ({children}) => (
    <div
        className={`layout-tabs-root`}
        style={{
            height: "100%",
            display: "flex",
            position: "relative",
            flexDirection: "column",
            boxSizing: "border-box",
        }}>
        {children}
    </div>
);
