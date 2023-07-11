import React, {FC, useEffect, useMemo} from "react";
import {AppState} from "../../state/AppState";
import {ValuePanelState} from "../../state/ValuePanelState";
import {useDataHook} from "model-react";
import {TextPanel} from "./text/TextPanel";
import {GraphValueState} from "../../state/valueTypes/GraphValueState";
import {GraphPanel} from "./graph/GraphPanel";
import {
    DirectionalHint,
    IContextualMenuProps,
    IconButton,
    TooltipHost,
    useTheme,
} from "@fluentui/react";
import {useId} from "@fluentui/react-hooks";
import {PlainValueState} from "../../state/valueTypes/PlainValueState";
import {StyledTooltipHost} from "../../components/StyledToolTipHost";

export const ValuePanel: FC<{state: AppState; panel: ValuePanelState}> = ({
    state,
    panel,
}) => {
    const [h] = useDataHook();
    const type = panel.getSelectedType(h);
    const theme = useTheme();

    const visualizationSelectionId = useId("visualization");
    const visualization =
        type instanceof GraphValueState ? (
            <GraphPanel state={state} graphState={type} />
        ) : type instanceof PlainValueState ? (
            <TextPanel state={state} panel={panel} textState={type} />
        ) : (
            <></>
        );

    const options = panel.getApplicableTypes(h);
    const selectVisualizationProps = useMemo<IContextualMenuProps>(
        () => ({
            shouldFocusOnMount: true,
            directionalHint: DirectionalHint.bottomLeftEdge,
            styles: {root: {background: theme.palette.neutralLighterAlt}},
            items: options.map(option => ({
                key: option.type,
                iconProps: {iconName: option.description.icon},
                text: option.description.name,
                onClick: () => panel.selectType(option),
            })),
        }),
        [visualization, options]
    );

    return (
        <>
            {options.length > 1 && (
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 1,
                        backgroundColor: theme.palette.neutralLighter,
                    }}>
                    <StyledTooltipHost
                        content="Switch visualization"
                        id={visualizationSelectionId}
                        directionalHint={DirectionalHint.bottomLeftEdge}>
                        <IconButton
                            iconProps={{iconName: type.description.icon ?? "PictureFill"}}
                            aria-labelledby={visualizationSelectionId}
                            aria-label="Switch visualization"
                            menuProps={selectVisualizationProps}
                        />
                    </StyledTooltipHost>
                </div>
            )}
            {visualization}
        </>
    );
};
