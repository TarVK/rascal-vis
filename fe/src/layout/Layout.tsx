import React, {FC} from "react";
import {ILayoutProps} from "./_types/ILayoutProps";
import {LayoutPanel} from "./LayoutPanel";
import {useDataHook} from "model-react";

/**
 * The layout entry component, where styling components still have to be provided
 */
export const Layout: FC<ILayoutProps> = ({state, components}) => {
    const [h] = useDataHook();
    return (
        <div className="layout-root" style={{height: "100%"}}>
            <LayoutPanel
                state={state}
                components={components}
                panel={state.getLayoutState(h)}
            />
            <components.DragPreview data={state.getDraggingData(h)} state={state} />
        </div>
    );
};
