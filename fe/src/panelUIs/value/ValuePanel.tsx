import React, {FC, useEffect} from "react";
import {AppState} from "../../state/AppState";
import {ValuePanelState} from "../../state/ValuePanelState";
import {useDataHook} from "model-react";
import {TextPanel} from "./text/TextPanel";

export const ValuePanel: FC<{state: AppState; panel: ValuePanelState}> = ({
    state,
    panel,
}) => {
    const [h] = useDataHook();
    const type = panel.getSelectedType(h);

    // if(type.type == "plain")
    return <TextPanel state={state} panel={panel} />;
};
