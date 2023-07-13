import React, {FC, ReactPortal, useEffect} from "react";
import {createPortal} from "react-dom";
import {LayoutState} from "./LayoutState";
import {IContentGetter} from "./_types/IContentGetter";
import {useDataHook, useMemoDataHook} from "model-react";

/**
 * Makes sure that all the contents are rendered in their target elements
 */
export const TabsRenderer: FC<{state: LayoutState; getContent: IContentGetter}> = ({
    state,
    getContent,
}) => {
    const [tabData] = useMemoDataHook(
        h =>
            state.getAllTabs(h).flatMap(ref => {
                const content = getContent(ref.id, h!);
                if (!content) return [];
                return [{element: ref.element, ...content}];
            }),
        []
    );

    return (
        <>{tabData.map(({id, element, content}) => createPortal(content, element, id))}</>
    );
};
