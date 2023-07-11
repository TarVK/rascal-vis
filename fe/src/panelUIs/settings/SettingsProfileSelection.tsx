import React, {FC, useCallback, useState} from "react";
import {LayoutPanelState} from "../../state/LayoutPanelState";
import {AppState} from "../../state/AppState";
import {PanelContainer} from "../../components/PanelContainer";
import {PanelState} from "../../state/PanelState";
import {
    ComboBox,
    DefaultButton,
    Dialog,
    DialogFooter,
    Dropdown,
    FontIcon,
    IDropdownOption,
    IconButton,
    Label,
    PrimaryButton,
    TextField,
    TooltipHost,
    useTheme,
} from "@fluentui/react";
import {useDragStart} from "../../utils/useDragStart";
import {SettingsState} from "../../state/SettingsState";
import {useDataHook} from "model-react";
import {useId} from "@fluentui/react-hooks";
import {StyledTooltipHost} from "../../components/StyledToolTipHost";

export const SettingsProfileSelection: FC<{panel: SettingsState; state: AppState}> = ({
    panel,
    state,
}) => {
    const deleteId = useId("delete");
    const addId = useId("add");
    const [h] = useDataHook();
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const selectProfile = useCallback((e, item: IDropdownOption) => {
        const id = item.key;
        const profile = panel.getProfiles().find(({id: pid}) => pid == id);
        if (profile) {
            panel.saveProfile();
            panel.loadProfile(profile);
        }
    }, []);
    const deleteProfile = useCallback(() => {
        panel.deleteProfile(panel.getSelectedProfileID());
    }, []);
    const createProfile = useCallback(() => {
        panel.saveProfile();
        const name = panel.getProfileName();
        panel.addAndSelectProfile(name + " copy");
    }, []);
    const theme = useTheme();

    return (
        <>
            <div
                style={{
                    boxShadow: "rgb(87 87 87 / 35%) 0px 0px 0px 1px inset",
                    minHeight: 5,
                }}
            />
            <div
                style={{
                    display: "flex",
                    paddingLeft: 10,
                    alignItems: "end",
                    background: theme.palette.neutralLight,
                }}>
                <Label>Profile:</Label>
                <ComboBox
                    styles={{
                        container: {
                            flexGrow: 1,
                            marginLeft: 10,
                        },
                        root: {
                            ":after": {
                                border: "none",
                            },
                            background: theme.palette.neutralLighterAlt,
                        },
                        input: {background: theme.palette.neutralLighterAlt},
                        optionsContainer: {background: theme.palette.neutralLighterAlt},
                    }}
                    useComboBoxAsMenuWidth
                    onChange={selectProfile}
                    onInputValueChange={text => panel.setProfileName(text)}
                    selectedKey={panel.getSelectedProfileID(h)}
                    allowFreeInput
                    options={panel.getProfiles(h).map(({id, name}) => ({
                        key: id,
                        text: name,
                    }))}
                />
                {panel.getProfiles(h).length > 1 && (
                    <StyledTooltipHost content={"Delete profile"} id={deleteId}>
                        <IconButton
                            iconProps={{iconName: "cancel"}}
                            aria-label="Delete profile"
                            aria-describedby={deleteId}
                            onClick={() => setShowDeleteConfirmation(true)}
                        />
                    </StyledTooltipHost>
                )}
                <StyledTooltipHost content={"Create profile"} id={addId}>
                    <IconButton
                        iconProps={{iconName: "add"}}
                        aria-label="Add profile"
                        aria-describedby={addId}
                        onClick={createProfile}
                    />
                </StyledTooltipHost>
                <Dialog
                    hidden={!showDeleteConfirmation}
                    onDismiss={() => setShowDeleteConfirmation(false)}
                    dialogContentProps={{
                        title: "Delete profile",
                        subText: "Are you sure you want to delete this settings profile?",
                    }}>
                    <DialogFooter>
                        <PrimaryButton onClick={deleteProfile} text="Delete" />
                        <DefaultButton
                            onClick={() => setShowDeleteConfirmation(false)}
                            text="Don't delete"
                        />
                    </DialogFooter>
                </Dialog>
            </div>
        </>
    );
};
