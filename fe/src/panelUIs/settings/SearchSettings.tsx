import React, {FC, useCallback, useEffect, useState} from "react";
import {SettingsState} from "../../state/SettingsState";
import {AppState} from "../../state/AppState";
import {useDataHook} from "model-react";
import {SpinButton, useTheme} from "@fluentui/react";
import {SettingsSectionContainer} from "./SettingsSectionContainer";
import {StyledSpinButton} from "../../components/StyledSpinButton";

export const SearchSettings: FC<{panel: SettingsState; state: AppState}> = ({
    panel,
    state,
}) => {
    const [h] = useDataHook();
    const settings = panel.getSettings(h).search;
    const theme = useTheme();

    return (
        <SettingsSectionContainer title="Search settings">
            <div style={{display: "flex", flexWrap: "wrap", gap: 10}}>
                <StyledSpinButton
                    label="Initial result count"
                    value={settings.initialLoadCount + ""}
                    min={1}
                    step={1}
                    incrementButtonAriaLabel="Increase value by 1"
                    decrementButtonAriaLabel="Decrease value by 1"
                    onChange={(e, v) =>
                        panel.updateSettings({search: {initialLoadCount: Number(v)}})
                    }
                />
                <StyledSpinButton
                    label="Load more count"
                    value={settings.loadMoreCount + ""}
                    min={1}
                    step={1}
                    incrementButtonAriaLabel="Increase value by 1"
                    decrementButtonAriaLabel="Decrease value by 1"
                    onChange={(e, v) =>
                        panel.updateSettings({search: {loadMoreCount: Number(v)}})
                    }
                />
            </div>
        </SettingsSectionContainer>
    );
};
