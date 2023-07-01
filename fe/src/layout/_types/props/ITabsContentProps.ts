import {IContent} from "../IContentGetter";

export type ITabsContentProps = {
    contents: (IContent & {selected: boolean})[];
};
