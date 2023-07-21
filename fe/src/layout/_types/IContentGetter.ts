import {MouseEvent} from "react";
import {IDataHook} from "model-react";

/**
 * The function to retrieve the content for a given tab
 * @param id The id of the tab to get the content for
 * @param hook The data hook to subscribe to changes
 * @returns The tab content
 */
export type IContentGetter = (id: string, hook: IDataHook) => IContent | null;

/**
 * The content to be displayed in the tab
 */
export type IContent = {
    name: string;
    id: string;
    content: JSX.Element;
    onTabContext?: (event: MouseEvent) => void;
    forceOpen?: boolean;
};
