import React, {FC} from "react";
import {SettingsState} from "../../state/SettingsState";
import {AppState} from "../../state/AppState";
import {useDataHook} from "model-react";
import {Slider, Toggle, useTheme} from "@fluentui/react";
import {SettingsSectionContainer} from "./SettingsSectionContainer";

export const TextValueSettings: FC<{panel: SettingsState; state: AppState}> = ({
    panel,
    state,
}) => {
    const [h] = useDataHook();
    const settings = panel.getSettings(h).text;
    const theme = useTheme();

    return (
        <SettingsSectionContainer title="Value explorer settings">
            <div style={{display: "flex", gap: 10, flexWrap: "wrap"}}>
                <Slider
                    styles={{root: {flexGrow: 1, width: 150}}}
                    label="Highlight opacity"
                    min={0}
                    max={1}
                    step={0.05}
                    value={settings.highlightIntensity}
                    showValue
                    onChange={v => panel.updateSettings({text: {highlightIntensity: v}})}
                />
                <Slider
                    styles={{root: {flexGrow: 1, width: 150}}}
                    label="Hover highlight opacity"
                    min={0}
                    max={1}
                    step={0.05}
                    value={settings.hoverHighlightIntensity}
                    showValue
                    onChange={v =>
                        panel.updateSettings({text: {hoverHighlightIntensity: v}})
                    }
                />
            </div>
            <div
                style={{
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                }}>
                <Toggle
                    styles={{root: {minWidth: 90, flexGrow: 1}}}
                    label="Map size"
                    checked={settings.showCollectionSizes.map}
                    onChange={(e, v) =>
                        panel.updateSettings({text: {showCollectionSizes: {map: v}}})
                    }
                    onText="Show"
                    offText="Hide"
                />
                <Toggle
                    styles={{root: {minWidth: 90, flexGrow: 1}}}
                    label="Set size"
                    checked={settings.showCollectionSizes.set}
                    onChange={(e, v) =>
                        panel.updateSettings({text: {showCollectionSizes: {set: v}}})
                    }
                    onText="Show"
                    offText="Hide"
                />
                <Toggle
                    styles={{root: {minWidth: 90, flexGrow: 1}}}
                    label="Tuple size"
                    checked={settings.showCollectionSizes.tuple}
                    onChange={(e, v) =>
                        panel.updateSettings({text: {showCollectionSizes: {tuple: v}}})
                    }
                    onText="Show"
                    offText="Hide"
                />
                <Toggle
                    styles={{root: {minWidth: 90, flexGrow: 1}}}
                    label="List size"
                    checked={settings.showCollectionSizes.list}
                    onChange={(e, v) =>
                        panel.updateSettings({text: {showCollectionSizes: {list: v}}})
                    }
                    onText="Show"
                    offText="Hide"
                />
            </div>
        </SettingsSectionContainer>
    );
};
