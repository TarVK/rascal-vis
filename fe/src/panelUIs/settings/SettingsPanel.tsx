import React, {FC, useCallback, useState} from "react";
import {LayoutPanelState} from "../../state/LayoutPanelState";
import {AppState} from "../../state/AppState";
import {PanelContainer} from "../../components/PanelContainer";
import {SettingsState} from "../../state/SettingsState";
import {useDataHook} from "model-react";
import {useId} from "@fluentui/react-hooks";
import {SettingsProfileSelection} from "./SettingsProfileSelection";
import {TextValueSettings} from "./TextValueSettings";
import {SearchSettings} from "./SearchSettings";
import {css} from "@emotion/css";
import {SettingsSectionContainer} from "./SettingsSectionContainer";

export const SettingsPanel: FC<{panel: SettingsState; state: AppState}> = ({
    panel,
    state,
}) => {
    const [h] = useDataHook();

    return (
        <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
            <SettingsProfileSelection panel={panel} state={state} />
            <div style={{flexGrow: 1}}>
                <PanelContainer className={css({overflow: "auto"})}>
                    <SettingsSectionContainer title="Layout">
                        Note that data about the layout and individual tabs is also saved
                        per profile
                    </SettingsSectionContainer>
                    <TextValueSettings panel={panel} state={state} />
                    <SearchSettings panel={panel} state={state} />
                </PanelContainer>
            </div>
        </div>
    );
};
