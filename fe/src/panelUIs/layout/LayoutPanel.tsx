import React, {FC} from "react";
import {LayoutPanelState} from "../../state/LayoutPanelState";
import {AppState} from "../../state/AppState";
import {PanelContainer} from "../../components/PanelContainer";
import {PanelState} from "../../state/PanelState";
import {FontIcon, useTheme} from "@fluentui/react";
import {useDragStart} from "../../utils/useDragStart";

export const LayoutPanel: FC<{panel: LayoutPanelState; state: AppState}> = ({
    panel,
    state,
}) => {
    const panels = panel.getPanels();
    return (
        <PanelContainer>
            {panels.map(panel => (
                <PanelEntry key={panel.getID()} panel={panel} state={state} />
            ))}
        </PanelContainer>
    );
};

export const PanelEntry: FC<{panel: PanelState; state: AppState}> = ({panel, state}) => {
    const theme = useTheme();
    const ref = useDragStart(() => {
        const layoutState = state.getLayoutState();
        const containers = layoutState.getAllTabPanels();
        const container = containers.find(({tabs}) =>
            tabs.some(({id}) => id == panel.getID())
        );
    });

    return (
        <div
            ref={ref}
            style={{
                height: 50,
                marginBottom: 10,
                background: theme.palette.neutralLighter,
                display: "flex",
                alignItems: "center",
            }}>
            <FontIcon iconName="GripperDotsVertical" style={{fontSize: 40}} />
        </div>
    );
};
