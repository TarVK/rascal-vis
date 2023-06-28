import React, {FC} from "react";
import {ITabsContentProps} from "../_types/props/ITabsContentProps";

export const TabsContent: FC<ITabsContentProps> = ({content}) => (
    <div style={{flexGrow: 1}}>{content}</div>
);
