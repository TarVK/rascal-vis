import {LayoutState} from "../LayoutState";
import {ILayoutComponents} from "./ILayourComponents";

export type ILayoutProps = {
    /** The state of the layout component, used for imperative control */
    state: LayoutState;
    /** The components to use for the styling of the layout */
    components: ILayoutComponents;
};
