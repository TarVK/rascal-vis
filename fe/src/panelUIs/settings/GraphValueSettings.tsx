import React, {FC} from "react";
import {SettingsState} from "../../state/SettingsState";
import {AppState} from "../../state/AppState";
import {useDataHook} from "model-react";
import {Slider, Toggle, useTheme} from "@fluentui/react";
import {SettingsSectionContainer} from "./SettingsSectionContainer";

export const GraphValueSettings: FC<{panel: SettingsState; state: AppState}> = ({
    panel,
    state,
}) => {
    const [h] = useDataHook();
    const settings = panel.getSettings(h).graph;
    const theme = useTheme();

    return (
        <SettingsSectionContainer title="Graph visualization settings">
            <div style={{display: "flex", gap: 10, flexWrap: "wrap"}}>
                <Slider
                    styles={{root: {width: 150}}}
                    label="Rendering sharpness"
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={settings.sharpness}
                    showValue
                    onChange={v => panel.updateSettings({graph: {sharpness: v}})}
                />
            </div>
        </SettingsSectionContainer>
    );
};
