import React, {FC, useCallback, useEffect, useRef, useState} from "react";
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
        // state.setValueText('range(105,<105, "">)');
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
