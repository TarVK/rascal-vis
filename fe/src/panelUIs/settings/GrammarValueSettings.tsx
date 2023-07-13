import React, {FC} from "react";
import {SettingsState} from "../../state/SettingsState";
import {AppState} from "../../state/AppState";
import {useDataHook} from "model-react";
import {Slider, Toggle, useTheme} from "@fluentui/react";
import {SettingsSectionContainer} from "./SettingsSectionContainer";

export const GrammarValueSettings: FC<{panel: SettingsState; state: AppState}> = ({
    panel,
    state,
}) => {
    const [h] = useDataHook();
    const settings = panel.getSettings(h).grammar;

    return (
        <SettingsSectionContainer title="Grammar settings">
            <div style={{display: "flex", gap: 10, flexWrap: "wrap"}}>
                <Slider
                    styles={{root: {flexGrow: 1, width: 150}}}
                    label="Minimum rule indentation"
                    min={0}
                    max={300}
                    step={1}
                    value={settings.alignWidth}
                    showValue
                    onChange={v => panel.updateSettings({grammar: {alignWidth: v}})}
                />
                <Toggle
                    styles={{root: {minWidth: 90, flexGrow: 1}}}
                    label="Show layout"
                    checked={settings.showLayout}
                    onChange={(e, v) => panel.updateSettings({grammar: {showLayout: v}})}
                    onText="Show"
                    offText="Hide"
                />
            </div>
        </SettingsSectionContainer>
    );
};
