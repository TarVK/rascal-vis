import {useTheme} from "@fluentui/react";
import React, {FC, ReactNode} from "react";

export const SettingsSectionContainer: FC<{title: ReactNode}> = ({children, title}) => {
    const theme = useTheme();

    return (
        <div
            style={{
                marginTop: 10,
                paddingBottom: 10,
                borderBottom: `${theme.palette.neutralLight} 3px solid`,
            }}>
            <h3>{title}</h3>
            {children}
        </div>
    );
};
