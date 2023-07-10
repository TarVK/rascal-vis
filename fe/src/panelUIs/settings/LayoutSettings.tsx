import React, {FC, useCallback, useEffect, useState} from "react";
import {SettingsState} from "../../state/SettingsState";
import {AppState} from "../../state/AppState";
import {useDataHook} from "model-react";
import {SpinButton, Toggle, useTheme} from "@fluentui/react";
import {SettingsSectionContainer} from "./SettingsSectionContainer";

export const LayoutSettings: FC<{panel: SettingsState; state: AppState}> = ({
    panel,
    state,
}) => {
    const [h] = useDataHook();
    const settings = panel.getSettings(h).layout;
    const theme = useTheme();

    return (
        <SettingsSectionContainer title="Layout settings">
            <p>
                Note that data about the layout and individual tabs is also saved per
                profile
            </p>
            <div style={{display: "flex", flexWrap: "wrap", gap: 10}}>
                <Toggle
                    styles={{root: {minWidth: 90, flexGrow: 1}}}
                    label="Delete empty panels"
                    checked={settings.deleteUnusedPanels}
                    onChange={(e, v) =>
                        panel.updateSettings({layout: {deleteUnusedPanels: v}})
                    }
                    onText="Delete"
                    offText="Keep"
                />
            </div>
        </SettingsSectionContainer>
    );
};
