import React, {FC} from "react";
import {ILayoutProps} from "./_types/ILayoutProps";
import {LayoutPanel} from "./LayoutPanel";
import {Loader, LoaderSwitch, useDataHook} from "model-react";
import {TabsRenderer} from "./TabsRenderer";

/**
 * The layout entry component, where styling components still have to be provided
 */
export const Layout: FC<ILayoutProps> = ({state, components, getContent}) => (
    <div className="layout-root" style={{height: "100%"}}>
        <Loader>
            {h => (
                <LayoutPanel
                    state={state}
                    components={components}
                    panel={state.getLayoutState(h)}
                    getContent={getContent}
                />
            )}
        </Loader>
        <Loader>
            {h => (
                <components.DragPreview data={state.getDraggingData(h)} state={state} />
            )}
        </Loader>
        <TabsRenderer state={state} getContent={getContent} />
    </div>
);
