import React, {FC, useEffect, useMemo, useRef} from "react";
import {ITabsContentProps} from "../_types/props/ITabsContentProps";
import {Field} from "model-react";
import {css} from "@emotion/css";

export const TabsContent: FC<ITabsContentProps> = ({contents}) => (
    <>
        {contents.map(({id, element, selected}) => (
            <TabTarget key={id} selected={selected} element={element} />
        ))}
    </>
);

export const TabTarget: FC<{selected: boolean; element: HTMLElement}> = ({
    selected,
    element,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        el.appendChild(element);
    }, [ref.current]);

    return (
        <div
            ref={ref}
            className={css({
                flexGrow: 1,
                flexShrink: 1,
                minHeight: 0,
                position: "relative",
                display: selected ? "flex" : "none",
                justifyItems: "stretch",
                "&>div": {
                    flexGrow: 1,
                    width: "100%",
                    minWidth: 0,
                },
            })}
        />
    );
};
