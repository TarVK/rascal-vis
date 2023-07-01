import React, {FC} from "react";
import {ILayoutProps} from "./_types/ILayoutProps";
import {LayoutPanel} from "./LayoutPanel";
import {useDataHook} from "model-react";
import {TabsRenderer} from "./TabsRenderer";

/**
 * The layout entry component, where styling components still have to be provided
 */
export const Layout: FC<ILayoutProps> = ({state, components, getContent}) => {
    const [h] = useDataHook();
    // console.log(state.getLayoutState(h));

    return (
        <div className="layout-root" style={{height: "100%"}}>
            <LayoutPanel
                state={state}
                components={components}
                panel={state.getLayoutState(h)}
                getContent={getContent}
            />
            <components.DragPreview data={state.getDraggingData(h)} state={state} />
            <TabsRenderer state={state} getContent={getContent} />
        </div>
    );
};
