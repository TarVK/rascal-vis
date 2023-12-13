import {css} from "@emotion/css";
import {useState, useRef, useEffect} from "react";
import {useTheme} from "@fluentui/react";
import {useAppState} from "../../../state/StateContext";
import {useDataHook} from "model-react";

export function useTreeNodeStyle() {
    const [keyboardSelect, setKeyboardSelect] = useState(false);
    const root = useRef<HTMLUListElement>(null);
    const theme = useTheme();
    useEffect(() => {
        const el = root.current;
        if (!el) return;

        const keyListener = () => setKeyboardSelect(true);
        const clickListener = () => setKeyboardSelect(false);
        el.addEventListener("keydown", keyListener);
        el.addEventListener("mousedown", clickListener);
        return () => {
            el.removeEventListener("keydown", keyListener);
            el.removeEventListener("mousedown", clickListener);
        };
    }, [root]);

    const state = useAppState();
    const [h] = useDataHook();
    const darkMode = state.getGlobalSettings(h).darkMode;

    return [
        css({
            // Remove default styling
            ".tree,.tree-node,.tree-node-group": {
                padding: 0,
                margin: 0,
                listStyle: "none",
            },
            ".tree-branch-wrapper,.tree-node__leaf": {
                outline: "none",
            },

            // Add custom styling
            ".tree-node": {
                cursor: "pointer",
            },
            ".tree-node--focused": {
                background: keyboardSelect
                    ? darkMode
                        ? theme.palette.neutralLight
                        : theme.palette.neutralLighter
                    : theme.palette.neutralLighterAlt,
            },
        }),
        root,
    ] as const;
}
