import {css} from "@emotion/css";
import {useTheme} from "@fluentui/react";
import {highlightTheme} from "./highlightTheme";
import {AppState} from "../../state/AppState";
import {useDataHook} from "model-react";

export function useHighlightStyle(state: AppState) {
    const theme = useTheme();
    const [h] = useDataHook();
    const highlight = state.getHighlight(h);
    const hoverHighlight = state.getHoverHighlight(h);

    return `${css({
        fontFamily: "consolas",
        ...highlightTheme(theme),
    })} ${
        highlight
            ? css({
                  [`.value[id='${highlight.id}']`]: {
                      backgroundColor: theme.palette.themeTertiary,
                  },
              })
            : undefined
    } ${
        hoverHighlight
            ? css({
                  [`.value[id='${hoverHighlight.id}']`]: {
                      position: "relative",
                      zIndex: 1,
                      "&:before": {
                          backgroundColor: theme.palette.themeTertiary,
                          opacity: 0.3,
                          zIndex: -1,
                          position: "absolute",
                          display: "block",
                          content: "''",
                          top: 0,
                          bottom: 0,
                          right: 0,
                          left: 0,
                      },
                  },
              })
            : undefined
    }`;
}
