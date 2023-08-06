import React, {FC, useCallback} from "react";
import {InputPanelState} from "../../state/InputPanelstate";
import {AppState} from "../../state/AppState";
import {PanelContainer} from "../../components/PanelContainer";
import {Checkbox, IconButton, Label, TextField, Toggle, useTheme} from "@fluentui/react";
import {useDataHook} from "model-react";
import {useSyncState} from "../../utils/useSyncState";
import {useId} from "@fluentui/react-hooks";
import {StyledTooltipHost} from "../../components/StyledToolTipHost";
import {FormattedParseError} from "./FormattedParseError";
import {css} from "@emotion/css";
import {StyledSpinButton} from "../../components/StyledSpinButton";
import {FormattedFetchError} from "./FormattedFetchError";

export const InputPanel: FC<{panel: InputPanelState; state: AppState}> = ({
    panel,
    state,
}) => {
    const theme = useTheme();
    const updateId = useId("update");
    const [h] = useDataHook({debounce: -1});

    const manualInput = panel.getInputSourceType(h) == "manual";
    const selectManual = useCallback(() => panel.setInputSourceType("manual"), [panel]);
    const selectServer = useCallback(() => panel.setInputSourceType("server"), [panel]);

    const [inputText, setInputText] = useSyncState(panel.getInputText(h));
    const updateValue = useCallback(() => {
        if (panel.getInputSourceType() == "server") panel.setInputSourceType("manual");
        panel.setInputText(inputText);
    }, [inputText, panel]);
    const onKey = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key == "Enter") updateValue();
        },
        [panel, updateValue]
    );

    const parseError = state.parseError.get(h);
    const fetchError = panel.getFetchFail(h);

    return (
        <PanelContainer>
            <InputOption
                selected={!manualInput}
                onSelect={selectServer}
                name="Sync from server">
                <div style={{display: "flex", marginBottom: 10, gap: 10}}>
                    <Label>Source address</Label>
                    <TextField
                        styles={{root: {flexGrow: 1}, wrapper: {borderBottom: "none"}}}
                        value={panel.getInputSourceAddress(h)}
                        onChange={(e, v) => v != null && panel.setInputSourceAddress(v)}
                        underlined
                    />
                </div>
                <StyledSpinButton
                    label="Poll interval in milliseconds"
                    value={panel.getPollInterval(h) + ""}
                    min={1}
                    backgroundColor={theme.palette.white}
                    step={5}
                    incrementButtonAriaLabel="Increase value by 5"
                    decrementButtonAriaLabel="Decrease value by 5"
                    onChange={(e, v) => {
                        const val = Number(v);
                        if (!isNaN(val)) panel.setPollInterval(val);
                    }}
                />
                {!manualInput && parseError && (
                    <FormattedParseError
                        className={css({marginTop: 10})}
                        error={parseError}
                        input={state.getValueText(h) ?? ""}
                    />
                )}
                {!manualInput && fetchError && (
                    <FormattedFetchError
                        className={css({marginTop: 10})}
                        error={fetchError}
                    />
                )}
            </InputOption>
            <InputOption
                selected={manualInput}
                onSelect={selectManual}
                name="Manual input">
                <div style={{display: "flex"}}>
                    <TextField
                        value={inputText}
                        underlined
                        styles={{root: {flexGrow: 1}, wrapper: {borderBottom: "none"}}}
                        onChange={(e, v) => v != null && setInputText(v)}
                        onKeyDown={onKey}
                    />
                    <StyledTooltipHost content={"Update input"} id={updateId}>
                        <IconButton
                            iconProps={{iconName: "Send"}}
                            aria-label="Update input"
                            styles={{
                                root: {
                                    background: theme.palette.white,
                                    ":hover": {
                                        background: `${theme.palette.neutralLighterAlt} !important`,
                                    },
                                },
                            }}
                            aria-describedby={updateId}
                            onClick={updateValue}
                        />
                    </StyledTooltipHost>
                </div>
                {manualInput && parseError && (
                    <FormattedParseError
                        className={css({marginTop: 10})}
                        error={parseError}
                        input={state.getValueText(h) ?? ""}
                    />
                )}
            </InputOption>
        </PanelContainer>
    );
};

const InputOption: FC<{selected: boolean; onSelect: () => void; name: string}> = ({
    children,
    selected,
    onSelect,
    name,
}) => {
    const theme = useTheme();
    return (
        <div
            style={{
                overflow: "hidden",
                backgroundColor: theme.palette.neutralLighterAlt,
                marginBottom: 10,
            }}>
            <div
                onClick={onSelect}
                style={{
                    backgroundColor: theme.palette.neutralLighter,
                    padding: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                }}>
                <Checkbox checked={selected} />
                {name}
            </div>
            <div
                style={{
                    padding: 10,
                }}>
                {children}
            </div>
        </div>
    );
};
