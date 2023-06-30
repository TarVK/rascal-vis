import React, {FC} from "react";

/** Standard styling for the panel contents container */
export const PanelContainer: FC<{className?: string}> = ({className, children}) => {
    return (
        <div className={className} style={{padding: 10}}>
            {children}
        </div>
    );
};
