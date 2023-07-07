import {createContext, useContext} from "react";
import {AppState} from "./AppState";

export const StateContext = createContext<AppState>(null as any);

export const useAppState = () => useContext(StateContext);
