import React, {FC, Fragment, useRef, useLayoutEffect, ReactNode, useState} from "react";
import {IValNode} from "../../_types/IValNode";
import {IEntry, IVal} from "../../_types/IVal";
import {IHighlight} from "./_types/IHighlight";
import {highlight} from "./highlight";

// Based on an in browser measurement in chrome
const pixelsPerChar = 722 / 100;

export const ValueHighlight: FC<{value: IVal | IEntry; className?: string}> = ({
    value,
    className,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [content, setContent] = useState<ReactNode>(null);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        let oldWidth = 0;
        function calculate() {
            const el = ref.current;
            if (!el) return;

            const {width} = el.getBoundingClientRect();
            if (width == oldWidth || width == 0) return;
            console.log("calculate", value, width, oldWidth);
            oldWidth = width;
            const maxLength = width / pixelsPerChar;
            const highlightData = highlightFit(value, maxLength);
            // const highlightData = highlight(value, 2);
            setContent(highlightData.element);
        }
        calculate();

        const observer = new ResizeObserver(calculate);
        observer.observe(el);
        return () => observer.disconnect();
    }, [value]);

    return (
        <div
            className={className}
            ref={ref}
            style={{fontFamily: "consolas", fontSize: 13}}>
            {content}
        </div>
    );
};

/**
 * Highlights the given value, such that it has at most the number of specified characters
 * @param value The value to be highlighted
 * @param maxLength The maximum number of characters
 * @returns The highlighting data
 */
export function highlightFit(value: IVal | IEntry, maxLength: number): IHighlight {
    let prev = highlight(value, 0);
    for (let i = 1; i < 100; i++) {
        let newHighlight = highlight(value, i);
        if (newHighlight.length > maxLength) return prev;
        prev = newHighlight;
    }
    return prev;
}
