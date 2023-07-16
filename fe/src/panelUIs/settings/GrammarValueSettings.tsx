import React, {FC} from "react";
import {SettingsState} from "../../state/SettingsState";
import {AppState} from "../../state/AppState";
import {useDataHook} from "model-react";
import {Dropdown, Slider, Toggle, useTheme} from "@fluentui/react";
import {SettingsSectionContainer} from "./SettingsSectionContainer";
import {useMemo} from "react-resizable-panels/dist/declarations/src/vendor/react";
import {StyledDropdown} from "../../components/StyledDropdown";

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
                <div style={{flexGrow: 1}}></div>
            </div>
            <div style={{display: "flex", gap: 10, flexWrap: "wrap"}}>
                <Toggle
                    styles={{root: {minWidth: 90, flexGrow: 1, width: 0}}}
                    label="Show layout"
                    checked={settings.showLayout}
                    onChange={(e, v) => panel.updateSettings({grammar: {showLayout: v}})}
                    onText="Show"
                    offText="Hide"
                />
                <StyledDropdown
                    styles={{root: {flexGrow: 1, minWidth: 150, width: 0}}}
                    label="Show expand handle"
                    selectedKey={settings.showHandle}
                    onChange={(e, o) =>
                        o && panel.updateSettings({grammar: {showHandle: o.key as any}})
                    }
                    options={[
                        {
                            key: "never",
                            text: "Never",
                        },
                        {
                            key: "hover",
                            text: "On hover",
                        },
                        {
                            key: "always",
                            text: "Always",
                        },
                    ]}
                />
            </div>
        </SettingsSectionContainer>
    );
};
