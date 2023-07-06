import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import {DefaultLayout} from "./layout/DefaultLayout";
import {usePersistentMemo} from "./utils/usePersistentMemo";
import {AppState} from "./state/AppState";
import {IPanelComponents} from "./_types/IPanelComponents";
import val from "./value.txt";
import {TextPanel} from "./visualizations/text/TextPanel";
import {SearchPanelState} from "./state/SearchPanelState";
import {SearchPanel} from "./visualizations/search/SearchPanel";
import {StateContext} from "./state/StateContext";

export const App: FC = () => {
    const state = usePersistentMemo(() => {
        const state = new AppState();
        state.setValueText(val);
        // state.setValueText(
        //     "{[1,2,3,4,5,6,7], [7,6,5,4,3,2,1], [1,2,3,4,5,6,7,6,5,4,3,2,1]}"
        // );
        const nodes = state.valueNodes.get();
        if (nodes) {
            const search = new SearchPanelState(nodes);
            search.setName("Search");
            state.addPanel(search);
        }
        return state;
    }, []);

    return (
        <StateContext.Provider value={state}>
            <DefaultLayout
                state={state.getLayoutState()}
                getContent={(id, hook) => state.getPanelUI(id, components, hook)}
            />
        </StateContext.Provider>
    );
};

const components: IPanelComponents = {
    none: () => <div>Not found</div>,
    default: TextPanel,
    search: SearchPanel,
};
