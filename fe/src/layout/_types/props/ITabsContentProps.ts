import {Field} from "model-react";
import {IContent} from "../IContentGetter";

export type ITabsContentProps = {
    contents: (Omit<IContent, "content"> & {
        selected: boolean;
        element: HTMLDivElement;
    })[];
};
