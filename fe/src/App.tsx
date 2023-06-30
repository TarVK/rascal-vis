import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import {Stack, StackItem, getTheme, Dropdown, PrimaryButton} from "@fluentui/react";
import {value} from "./parse/parser";
import {
    ImperativePanelHandle,
    PanelGroup,
    PanelResizeHandle,
    Panel,
} from "react-resizable-panels";
import {LayoutState} from "./layout/LayoutState";
import {DefaultLayout} from "./layout/DefaultLayout";
import {usePersistentMemo} from "./utils/usePersistentMemo";
import {AppState} from "./state/AppState";
import {IPanelComponents} from "./_types/IPanelComponents";
import val from "./value.txt";
import {TextPanel} from "./visualizations/text/TextPanel";

export const App: FC = () => {
    const state = usePersistentMemo(() => {
        const state = new AppState();
        state.setValueText(val);
        return state;
    }, []);

    return (
        <>
            <DefaultLayout
                state={state.getLayoutState()}
                getContent={(id, hook) => state.getPanelUI(id, components, hook)}
            />
        </>
    );
};

const components: IPanelComponents = {
    none: () => <div>Not found</div>,
    default: TextPanel,
};
