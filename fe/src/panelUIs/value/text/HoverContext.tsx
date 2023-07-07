import React, {FC, useCallback, createContext, useMemo, useContext} from "react";
import {AppState} from "../../../state/AppState";
import {IVal} from "../../../_types/IVal";
import {IHoverHandlers} from "./_types/IHoverHandler";

export const HoverContextProvider: FC<{state: AppState}> = ({state, children}) => {
    const onHover = useCallback(
        (val: IVal | null) => state.setHoverHighlight(val),
        [state]
    );
    const hoverHandlers = useMemo<IHoverHandlers>(() => {
        const hoverStack: IVal[] = [];
        const map = new Map<number, {onEnter: () => void; onLeave: () => void}>();
        return (value: IVal) => {
            const handler = map.get(value.id);
            if (handler) return handler;

            const newHandler = {
                onEnter: () => {
                    hoverStack.push(value);
                    onHover(value);
                },
                onLeave: () => {
                    const index = hoverStack.lastIndexOf(value);
                    if (index == -1) return;
                    hoverStack.splice(index, 1);
                    const top = hoverStack[hoverStack.length - 1] ?? null;
                    onHover(top);
                },
            };
            map.set(value.id, newHandler);
            return newHandler;
        };
    }, [onHover]);

    return (
        <HoverContext.Provider value={hoverHandlers}>{children}</HoverContext.Provider>
    );
};

export const HoverContext = createContext<IHoverHandlers | undefined>(undefined);
export const useHoverHandlers = () => useContext(HoverContext);
