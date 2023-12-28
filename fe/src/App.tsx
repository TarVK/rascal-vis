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
import {ThemeProvider} from "@devtools-ds/themes";
import {initializeIcons, ThemeProvider as FluentThemeProvider} from "@fluentui/react";
import {darkTheme, lightTheme} from "./theme";
import {Loader, useDataHook} from "model-react";

initializeIcons();
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
        <ContextAndThemeProvider state={state}>
            <div style={{display: "flex", height: "100%"}}>
                <Sidebar />
                <div style={{flexGrow: 1, flexShrink: 1, minWidth: 0}}>
                    <UserLayout state={state} />
                </div>
            </div>
        </ContextAndThemeProvider>
    );
};

const UserLayout: FC<{state: AppState}> = ({state}) => (
    <TabContextMenu state={state}>
        {onContext => (
            <Loader>
                {h => (
                    <DefaultLayout
                        key={state.specialTabs.settings.getSelectedProfileID(h)}
                        state={state.getLayoutState()}
                        getContent={(id, hook) =>
                            state.getPanelUI(id, components, onContext, hook)
                        }
                    />
                )}
            </Loader>
        )}
    </TabContextMenu>
);

const components: IPanelComponents = {
    none: () => <div>Not found</div>,
    value: ValuePanel,
    search: SearchPanel,
    layout: LayoutPanel,
    settings: SettingsPanel,
    input: InputPanel,
    info: InfoPanel,
};

const ContextAndThemeProvider: FC<{state: AppState}> = ({state, children}) => {
    const [h] = useDataHook();
    const darkMode = state.getGlobalSettings(h).darkMode;

    return (
        <StateContext.Provider value={state}>
            <FluentThemeProvider theme={darkMode ? darkTheme : lightTheme}>
                <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
                    {children}
                </ThemeProvider>
            </FluentThemeProvider>
        </StateContext.Provider>
    );
};
