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

        let prevData: {fit: IHighlight; noFit: IHighlight | null} | null = null;
        function calculate() {
            const el = ref.current;
            if (!el) return;

            const {width} = el.getBoundingClientRect();
            if (width == 0) return;

            const maxLength = width / pixelsPerChar;
            if (prevData) {
                const inRange =
                    prevData.fit.length <= maxLength &&
                    (!prevData.noFit || maxLength < prevData.noFit.length);
                if (inRange) return;
            }

            const highlightData = highlightFit(value, maxLength);
            // const highlightData = highlight(value, 2);
            prevData = highlightData;
            setContent(highlightData.fit.element);
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
 * @returns The highlighting data that does fit, and the next data that doesn't fit
 */
export function highlightFit(
    value: IVal | IEntry,
    maxLength: number
): {fit: IHighlight; noFit: IHighlight | null} {
    let prev = highlight(value, 0);
    for (let i = 1; i < 100; i++) {
        let newHighlight = highlight(value, i);
        if (newHighlight.length == prev.length) return {fit: prev, noFit: null};
        if (newHighlight.length > maxLength) return {fit: prev, noFit: newHighlight};
        prev = newHighlight;
    }
    return {fit: prev, noFit: null};
}
