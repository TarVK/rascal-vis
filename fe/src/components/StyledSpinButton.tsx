import React, {FC} from "react";
import {ISpinButtonProps, SpinButton, mergeStyleSets, useTheme} from "@fluentui/react";

export const StyledSpinButton: FC<
    ISpinButtonProps & {backgroundColor?: string}
> = props => {
    const theme = useTheme();
    const style: ISpinButtonProps["styles"] = {
        spinButtonWrapper: {
            ":after": {
                border: "none",
            },
            flexGrow: 1,
        },
        input: {
            background: props.backgroundColor ?? theme.palette.neutralLighterAlt,
            width: 0,
        },
        arrowButtonsContainer: {
            background: theme.palette.neutralLight,
        },
        root: {
            display: "flex",
            width: "auto",
            flexGrow: 1,
        },
    };
    return <SpinButton {...props} styles={mergeStyleSets(style, props.styles)} />;
};
