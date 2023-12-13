import {DirectionalHint, IconButton, TooltipHost, useTheme} from "@fluentui/react";
import React, {FC, useCallback} from "react";
import {useAppState} from "./state/StateContext";
import {PanelState} from "./state/PanelState";
import {useId} from "@fluentui/react-hooks";
import {SpecialTabsState} from "./state/SpecialTabsState";
import {useDragStart} from "./utils/useDragStart";
import {css} from "@emotion/css";
import {StyledTooltipHost} from "./components/StyledToolTipHost";
import {useDataHook} from "model-react";
import {GithubIcon} from "./components/GithubIcon";

const size = 50;
export const Sidebar: FC = () => {
    const theme = useTheme();
    const state = useAppState();
    const tabsState = state.specialTabs;
    const githubId = useId("github");

    const themeId = useId("theme");
    const [h] = useDataHook();
    const darkMode = state.getGlobalSettings(h).darkMode;

    return (
        <>
            <div
                style={{
                    width: size,
                    backgroundColor: theme.palette.neutralLight,
                    display: "flex",
                    flexDirection: "column",
                }}>
                {tabsState.tabs.map(props => (
                    <SidebarButton key={props.name} specialTabs={tabsState} {...props} />
                ))}

                <div style={{flexGrow: 1}} />
                <StyledTooltipHost
                    content={`Enable ${darkMode ? "light" : "dark"} mode`}
                    directionalHint={DirectionalHint.rightCenter}
                    id={themeId}>
                    <IconEl
                        tooltipId={themeId}
                        name="dark mode"
                        icon={darkMode ? "ClearNight" : "Sunny"}
                        onClick={() => state.updateGlobalSettings({darkMode: !darkMode})}
                    />
                </StyledTooltipHost>
                <StyledTooltipHost
                    content="Github repository"
                    directionalHint={DirectionalHint.rightCenter}
                    id={githubId}>
                    <IconButton
                        aria-describedby={githubId}
                        className={css({
                            width: size,
                            height: size,
                            backgroundColor: theme.palette.neutralLight,
                        })}
                        onRenderIcon={() => (
                            <GithubIcon
                                width={size * 0.55}
                                color={theme.palette.neutralPrimary}
                                hoverColor={theme.palette.themePrimary}
                            />
                        )}
                        aria-label="Github"
                        href="https://github.com/TarVK/rascal-vis"
                    />
                </StyledTooltipHost>
            </div>
            <div
                style={{
                    minWidth: 10,
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
    const [h] = useDataHook();
    const onClick = useCallback(() => {
        if (specialTabs.isVisible(panel)) specialTabs.close(panel);
        else specialTabs.open(panel);
    }, []);
    const isVisible = specialTabs.isVisible(panel, h);

    const iconEl = (
        <IconEl
            tooltipId={tooltipId}
            isVisible={isVisible}
            name={name}
            icon={icon}
            onClick={onClick}
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

const IconEl: FC<{
    tooltipId: string;
    isVisible?: boolean;
    name: string;
    icon: string;
    onClick: () => void;
}> = ({tooltipId, isVisible = false, name, icon, onClick}) => {
    const theme = useTheme();
    return (
        <IconButton
            aria-describedby={tooltipId}
            className={css({
                width: size,
                height: size,
                color: theme.palette.neutralPrimary,
                backgroundColor: isVisible
                    ? theme.palette.neutralLighterAlt
                    : theme.palette.neutralLight,
            })}
            iconProps={{iconName: icon, style: {fontSize: size * 0.5}}}
            aria-label={name}
            onClick={onClick}
        />
    );
};
