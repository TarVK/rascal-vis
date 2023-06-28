import React, {FC} from "react";
import {ITabsContainerProps} from "../_types/props/ITabsContainerProps";

export const TabsContainer: FC<ITabsContainerProps> = ({children}) => (
    <div
        className="layout-tabs-root"
        style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            border: "1px solid black",
        }}>
        {children}
    </div>
);
