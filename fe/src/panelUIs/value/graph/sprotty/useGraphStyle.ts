import {css} from "@emotion/css";
import {useTheme} from "@fluentui/react";

export function useGraphStyle() {
    const theme = useTheme();
    return css({
        width: "100%",
        height: "100%",
        "& svg": {
            width: "100%",
            height: "100%",
            "&:focus": {
                outline: "none",
            },
        },

        ".node": {
            fill: theme.palette.themeSecondary,
        },
        ".selected .node": {
            fill: theme.palette.themeDarkAlt,
        },
        ".sprotty-edge": {
            fill: "none",
            stroke: theme.palette.themeTertiary,
            strokeWidth: 3,
            "& polygon": {
                strokeWidth: 0,
                fill: theme.palette.themeTertiary,
            },
        },
        ".sprotty-routing-handle": {
            radius: 4,
            fill: theme.palette.themeSecondary,
        },
        text: {
            strokeWidth: 0,
            stroke: theme.palette.black,
            fill: theme.palette.black,
            fontFamily: "consolas",
            fontSize: 14,
            textAnchor: "middle",
            alignmentBaseline: "central",
            textAlign: "center",
        },
    });
}
