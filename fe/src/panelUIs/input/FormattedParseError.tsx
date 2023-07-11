import React, {FC, Fragment} from "react";
import {Failure} from "parsimmon";
import {useTheme} from "@fluentui/react";
import {css} from "@emotion/css";

export const FormattedParseError: FC<{
    error: Failure;
    input: string;
    className?: string;
}> = ({error, input, className}) => {
    const el = error.expected.length;
    const theme = useTheme();
    return (
        <div
            className={`${css({
                color: theme.semanticColors.errorText,
            })} ${className}`}>
            Encountered a parse error at index {error.index.offset}. Found{" "}
            {error.index.offset >= input.length
                ? "EOF"
                : "'" + input.substr(error.index.offset, 1) + "'"}
            , but expected{" "}
            {error.expected.map((v, i) => (
                <Fragment key={i}>
                    {i == 0 ? "" : i == el - 1 ? ", or " : ", "} {v}
                </Fragment>
            ))}
        </div>
    );
};
