import React, {FC, useEffect} from "react";
import {DefaultLayout} from "./layout/DefaultLayout";
import {usePersistentMemo} from "./utils/usePersistentMemo";
import {AppState} from "./state/AppState";
import {IPanelComponents} from "./_types/IPanelComponents";
import {StateContext} from "./state/StateContext";
import {Sidebar} from "./SideBar";
import {ValuePanel} from "./panelUIs/value/ValuePanel";
import {SearchPanel} from "./panelUIs/search/SearchPanel";
import {LayoutPanel} from "./panelUIs/layout/LayoutPanel";
import {SettingsPanel} from "./panelUIs/settings/SettingsPanel";
import {InputPanel} from "./panelUIs/input/InputPanel";
import {InfoPanel} from "./panelUIs/info/InfoPanel";
import {TabContextMenu} from "./TabContextMenu";

export const App: FC = () => {
    const state = usePersistentMemo(() => {
        const state = new AppState();
        (window as any).state = state; // Useful for debugging
        state.loadProfilesData();
        return state;
    }, []);
    useEffect(() => {
        window.onunload = () => state.saveProfile();
    }, [state]);

    return (
        <StateContext.Provider value={state}>
            <div style={{display: "flex", height: "100%"}}>
                <Sidebar />
                <div style={{flexGrow: 1, flexShrink: 1, minWidth: 0}}>
                    <TabContextMenu state={state}>
                        {onContext => (
                            <DefaultLayout
                                state={state.getLayoutState()}
                                getContent={(id, hook) =>
                                    state.getPanelUI(id, components, onContext, hook)
                                }
                            />
                        )}
                    </TabContextMenu>
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
    input: InputPanel,
    info: InfoPanel,
};
