import React, {FC, useCallback, useState} from "react";
import {LayoutPanelState} from "../../state/LayoutPanelState";
import {AppState} from "../../state/AppState";
import {PanelContainer} from "../../components/PanelContainer";
import {SettingsState} from "../../state/SettingsState";
import {useDataHook} from "model-react";
import {useId} from "@fluentui/react-hooks";
import {SettingsProfileSelection} from "./SettingsProfileSelection";

export const SettingsPanel: FC<{panel: SettingsState; state: AppState}> = ({
    panel,
    state,
}) => {
    const [h] = useDataHook();

    return (
        <>
            <SettingsProfileSelection panel={panel} state={state} />
            <PanelContainer>hoi</PanelContainer>
        </>
    );
};
