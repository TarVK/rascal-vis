import React, {FC, useEffect, useMemo} from "react";
import {AppState} from "../../state/AppState";
import {ValuePanelState} from "../../state/ValuePanelState";
import {useDataHook} from "model-react";
import {TextPanel} from "./text/TextPanel";
import {GraphValueState} from "../../state/valueTypes/GraphValueState";
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
import {GrammarValueState} from "../../state/valueTypes/GrammarValueState";
import {GrammarPanel} from "./grammar/GrammarPanel";
import {ErrorBoundary} from "../../components/ErrorBoundary";
import {useChangeID} from "../../utils/useChangeID";
import {usePrevious} from "../../utils/usePrevious";
import {PanelContainer} from "../../components/PanelContainer";
import {GraphPanel} from "./graph/GraphPanel";

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
        ) : type instanceof GrammarValueState ? (
            <GrammarPanel state={state} grammarState={type} />
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

    const nodes = panel.getValueNodes(h);
    const prev = usePrevious(nodes);
    const id = useChangeID(prev != nodes);

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
            <ErrorBoundary
                key={id}
                onError={() => (
                    <PanelContainer>
                        <div style={{color: theme.semanticColors.errorText}}>
                            An unexpected error occurred, see console for details
                        </div>
                    </PanelContainer>
                )}>
                {visualization}
            </ErrorBoundary>
        </>
    );
};
