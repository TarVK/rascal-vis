import React, {FC} from "react";
import {
    IMessageBarProps,
    ISpinButtonProps,
    MessageBar,
    MessageBarType,
    SpinButton,
    mergeStyleSets,
    useTheme,
} from "@fluentui/react";

export const StyledMessageBar: FC<
    IMessageBarProps & {backgroundColor?: string}
> = props => {
    const theme = useTheme();
    const style: IMessageBarProps["styles"] =
        props.messageBarType == undefined || props.messageBarType == MessageBarType.info
            ? {
                  content: {
                      backgroundColor: theme.palette.neutralLighter,
                      color: theme.palette.black,
                  },
                  icon: {
                      color: theme.palette.neutralDark,
                  },
              }
            : {};
    return <MessageBar {...props} styles={mergeStyleSets(style, props.styles)} />;
};
