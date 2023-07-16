import {CSSObject, css} from "@emotion/css";
import {useTheme} from "@fluentui/react";
import {AppState} from "../../../state/AppState";
import {useDataHook} from "model-react";
import {highlightTheme} from "../../../theme";

export function useHighlightStyle(state: AppState) {
    const theme = useTheme();
    const [h] = useDataHook();
    const highlight = state.getHighlight(h);
    const hoverHighlight = state.getHoverHighlight(h);

    const settings = state.getSettings(h);
    const textSettings = settings.text;
    const grammarSettings = settings.grammar;

    const getColorStyle = (color: string, opacity: number): CSSObject =>
        opacity == 1
            ? {
                  backgroundColor: color,
              }
            : {
                  position: "relative",
                  zIndex: 1,
                  "&:before": {
                      backgroundColor: color,
                      opacity: opacity,
                      zIndex: -1,
                      position: "absolute",
                      display: "block",
                      content: "''",
                      top: 0,
                      bottom: 0,
                      right: 0,
                      left: 0,
                  },
              };

    return `${css({
        fontFamily: "consolas",
        ".expanded":{
            position: "relative",
            zIndex: 1,
            "&::before": {
                content: "''",
                display: "inline-block",
                position: "absolute",
                top: 19,
                bottom: 18,
                left: grammarSettings.showHandle=="always" ? 15 : 5,
                borderLeft: `2px solid ${theme.palette.neutralLighter}`,
                zIndex: -1
            },
        },
        ...highlightTheme(theme),
    })} ${
        highlight
            ? css({
                  [`.symbol[id='${highlight.id}'], .production[id='${highlight.id}']`]:
                      getColorStyle(
                          theme.palette.themeTertiary,
                          textSettings.highlightIntensity
                      ),
              })
            : undefined
    } ${
        hoverHighlight
            ? css({
                  [`.symbol[id='${hoverHighlight.id}'], .production[id='${hoverHighlight.id}']`]:
                      getColorStyle(
                          theme.palette.themeTertiary,
                          textSettings.hoverHighlightIntensity
                      ),
              })
            : undefined
    }`;
}
