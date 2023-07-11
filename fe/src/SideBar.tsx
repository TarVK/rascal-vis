import {DirectionalHint, IconButton, TooltipHost, useTheme} from "@fluentui/react";
import React, {FC} from "react";
import {useAppState} from "./state/StateContext";
import {PanelState} from "./state/PanelState";
import {useId} from "@fluentui/react-hooks";
import {SpecialTabsState} from "./state/SpecialTabsState";
import {useDragStart} from "./utils/useDragStart";
import {css} from "@emotion/css";
import {StyledTooltipHost} from "./components/StyledToolTipHost";

const size = 50;
export const Sidebar: FC = () => {
    const theme = useTheme();
    const state = useAppState();
    const tabsState = state.specialTabs;
    return (
        <>
            <div
                style={{
                    width: size,
                    backgroundColor: theme.palette.neutralLight,
                }}>
                {tabsState.tabs.map(props => (
                    <SidebarButton key={props.name} specialTabs={tabsState} {...props} />
                ))}
            </div>
            <div
                style={{
                    width: 10,
                    boxShadow: "inset #0000004d 0px 0px 6px 2px",
                }}
            />
        </>
    );
};

export const SidebarButton: FC<{
    name: string;
    icon: string;
    panel: PanelState;
    specialTabs: SpecialTabsState;
}> = ({name, icon, panel, specialTabs}) => {
    const theme = useTheme();
    const tooltipId = useId(name);
    const iconEl = (
        <IconButton
            aria-describedby={tooltipId}
            className={css({
                width: size,
                height: size,
                color: theme.palette.neutralPrimary,
                backgroundColor: theme.palette.neutralLight,
            })}
            iconProps={{iconName: icon, style: {fontSize: size * 0.5}}}
            aria-label={name}
            onClick={() => specialTabs.open(panel)}
        />
    );

    const state = useAppState();
    const ref = useDragStart((position, offset) => {
        const layout = state.getLayoutState();
        const container = layout
            .getAllTabPanels()
            .find(c => c.tabs.some(({id}) => id == panel.getID()));
        layout.setDraggingData({
            position,
            offset,
            targetId: panel.getID(),
            removeFromPanelId: container?.id,
            preview: iconEl,
        });
    });

    return (
        <StyledTooltipHost
            content={name}
            directionalHint={DirectionalHint.rightCenter}
            id={tooltipId}>
            <div ref={ref}>{iconEl}</div>
        </StyledTooltipHost>
    );
};
