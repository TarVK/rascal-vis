import {CSSObject} from "@emotion/css";
import {ITheme} from "@fluentui/react";

export const highlightTheme = (theme: ITheme): CSSObject => ({
    ".identifier": {
        color: "white",
    },
    ".symbol, .name, .location, .arrow": {
        color: "#bbbbbb",
    },
    ".string": {
        color: "#dadb74",
    },
    ".number, .boolean, .string .escaped": {
        color: "#ae81ff",
    },
    ".collapse, .count, .label": {
        color: "#747474",
    },
    ".context": {
        color: "#747474",
    },
    ".count,.label": {
        fontStyle: "italic",
    },
});
