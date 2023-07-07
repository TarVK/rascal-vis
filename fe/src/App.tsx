import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import {DefaultLayout} from "./layout/DefaultLayout";
import {usePersistentMemo} from "./utils/usePersistentMemo";
import {AppState} from "./state/AppState";
import {IPanelComponents} from "./_types/IPanelComponents";
import val from "./value.txt";
import {SearchPanelState} from "./state/SearchPanelState";
import {StateContext} from "./state/StateContext";
import {SpecialTabsState} from "./state/SpecialTabsState";
import {Sidebar} from "./SideBar";
import {ValuePanel} from "./panelUIs/value/ValuePanel";
import {SearchPanel} from "./panelUIs/search/SearchPanel";
import {LayoutPanel} from "./panelUIs/layout/LayoutPanel";
import {SettingsPanel} from "./panelUIs/settings/SettingsPanel";

export const App: FC = () => {
    const state = usePersistentMemo(() => {
        const state = new AppState();
        state.setValueText(val);
        state.loadProfilesData();
        (window as any).state = state;
        return state;
    }, []);
    useEffect(() => {
        window.onunload = () => state.saveProfile();
    }, [state]);

    return (
        <StateContext.Provider value={state}>
            <div style={{display: "flex", height: "100%"}}>
                <Sidebar />
                <div style={{flexGrow: 1}}>
                    <DefaultLayout
                        state={state.getLayoutState()}
                        getContent={(id, hook) => state.getPanelUI(id, components, hook)}
                    />
                </div>
            </div>
        </StateContext.Provider>
    );
};

const components: IPanelComponents = {
    none: () => <div>Not found</div>,
    value: ValuePanel,
    search: SearchPanel,
    layout: LayoutPanel,
    settings: SettingsPanel,
};
