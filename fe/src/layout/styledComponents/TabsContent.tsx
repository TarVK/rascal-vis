import React, {FC} from "react";
import {ITabsContentProps} from "../_types/props/ITabsContentProps";

export const TabsContent: FC<ITabsContentProps> = ({contents}) => (
    <>
        {contents.map(({id, content, selected}) => (
            <div key={id} style={{flexGrow: 1, display: selected ? undefined : "none"}}>
                {content}
            </div>
        ))}
    </>
);
