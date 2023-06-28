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

const layoutState = new LayoutState(id => ({
    id,
    name: id,
    content: <div>{id}</div>,
}));

export const App: FC = () => {
    return (
        <>
            <DefaultLayout state={layoutState} />
        </>
    );
};
