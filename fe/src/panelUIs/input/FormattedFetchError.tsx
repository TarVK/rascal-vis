import React, {FC, Fragment} from "react";
import {Failure} from "parsimmon";
import {useTheme} from "@fluentui/react";
import {css} from "@emotion/css";
import {CorsError, PathNotFoundError, ServerDownError} from "../../state/InputPanelstate";

export const FormattedFetchError: FC<{
    error: Error;
    className?: string;
}> = ({error, className}) => {
    const theme = useTheme();
    let message = error.message;
    if (error instanceof ServerDownError)
        message = "Could not reach the specified server";
    if (error instanceof CorsError)
        message = "Could not reach the path, this might be a CORS issue";
    if (error instanceof PathNotFoundError)
        message = "Could not reach the specified path";
    return (
        <div
            className={`${css({
                color: theme.semanticColors.errorText,
            })} ${className}`}>
            {message}.<div>See the javascript console for more information.</div>
        </div>
    );
};
