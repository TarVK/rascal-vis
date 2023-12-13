import {css} from "@emotion/css";
import {useTheme} from "@fluentui/react";
import {useAppState} from "../../../../state/StateContext";
import {useDataHook} from "model-react";

export function useGraphStyle() {
    const theme = useTheme();
    const [h] = useDataHook();
    const darkMode = useAppState().getGlobalSettings(h).darkMode;
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
        "g:has(.node)>text": {
            stroke: darkMode ? theme.palette.black : theme.palette.white,
            fill: darkMode ? theme.palette.black : theme.palette.white,
        },
        ".selected .node": {
            fill: theme.palette.themeDarkAlt,
        },
        ".sprotty-edge": {
            fill: "none",
            stroke: darkMode ? theme.palette.themeTertiary : theme.palette.themeDark,
            strokeWidth: 3,
            "& polygon": {
                strokeWidth: 0,
                fill: darkMode ? theme.palette.themeTertiary : theme.palette.themeDark,
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
