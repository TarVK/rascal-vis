import {createContext, useContext} from "react";
import {AppState} from "./AppState";

export const StateContext = createContext(new AppState());

export const useAppState = () => useContext(StateContext);
