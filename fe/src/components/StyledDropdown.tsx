import React, {FC} from "react";
import {Dropdown, IDropdownProps, ISpinButtonProps, SpinButton, mergeStyleSets, useTheme} from "@fluentui/react";

export const StyledDropdown: FC<
    IDropdownProps & {backgroundColor?: string}
> = props => {
    const theme = useTheme();
    const style: IDropdownProps["styles"] = {
        title: {
            border: "none",
            background: theme.palette.neutralLighterAlt
        },
        dropdownItem: {background: theme.palette.neutralLighterAlt},
    };
    return <Dropdown {...props} styles={mergeStyleSets(style, props.styles)} />;
};
