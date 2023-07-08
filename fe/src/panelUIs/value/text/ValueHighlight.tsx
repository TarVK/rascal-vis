import React, {
    FC,
    Fragment,
    useRef,
    useLayoutEffect,
    ReactNode,
    useState,
    RefObject,
    forwardRef,
    useCallback,
    useMemo,
} from "react";
import {IEntry, IVal} from "../../../_types/IVal";
import {IHighlight} from "./_types/IHighlight";
import {IHoverHandlers} from "./_types/IHoverHandler";
import {useHighlightCache} from "./HighlightCache";
import {IHighlightCache} from "./_types/IHighlightCache";
import {IHighlightSettings} from "./_types/IHighlightSettings";

// Based on an in browser measurement in chrome
const pixelsPerChar = 722 / 100;

export const ValueHighlight = forwardRef<
    HTMLDivElement,
    {
        value: IVal | IEntry;
        className?: string;
        minWidth?: number;
        hoverHandlers?: IHoverHandlers | undefined;
        settings: IHighlightSettings;
        wrapElement?: (node: ReactNode) => ReactNode;
    }
>(({value, className, wrapElement = n => n, hoverHandlers, settings, minWidth}, ref) => {
    // Determine the content at the right size, using the highlight function
    const sizeRef = useRef<HTMLDivElement>(null);
    const [content, setContent] = useState<ReactNode>(null);
    const highlight = useHighlightCache();
    useLayoutEffect(() => {
        const el = sizeRef.current;
        if (ref) {
            if (ref instanceof Function) ref(sizeRef.current);
            else (ref.current as any) = sizeRef.current;
        }
        if (!el) return;

        let prevData: {fit: IHighlight; noFit: IHighlight | null} | null = null;
        function calculate() {
            const el = sizeRef.current;
            if (!el) return;

            // Measure the width, and consider the min width during this
            let oldWidth = el.style.width;
            if (minWidth)
                el.style.minWidth = el.style.width =
                    typeof minWidth == "number" ? minWidth + "px" : minWidth;
            const {width} = el.getBoundingClientRect();
            if (minWidth) el.style.minWidth = el.style.width = oldWidth;
            if (width == 0) return;

            // Check if we need to adjust the highlighting
            const maxLength = width / pixelsPerChar;
            if (prevData) {
                const inRange =
                    prevData.fit.length <= maxLength &&
                    (!prevData.noFit || maxLength < prevData.noFit.length);
                if (inRange) return;
            }

            // Perform the highlighting
            const highlightData = highlightFit(
                highlight,
                value,
                maxLength,
                settings,
                hoverHandlers
            );
            // const highlightData = highlight(value, 2);
            prevData = highlightData;
            setContent(highlightData.fit.el);

            // Set the width, if there's a min width
            if (minWidth)
                el.style.minWidth = el.style.width =
                    Math.min(minWidth, highlightData.fit.length * pixelsPerChar) + "px";
        }
        calculate();

        const observer = new ResizeObserver(calculate);
        observer.observe(el);
        return () => observer.disconnect();
    }, [value, settings, hoverHandlers]);

    return (
        <div
            className={className}
            ref={sizeRef}
            style={{fontFamily: "consolas", fontSize: 13}}>
            {wrapElement(content)}
        </div>
    );
});

/**
 * Highlights the given value, such that it has at most the number of specified characters
 * @param highlight The highlight function to use
 * @param value The value to be highlighted
 * @param maxLength The maximum number of characters
 * @param handler The mouse hover handlers
 * @returns The highlighting data that does fit, and the next data that doesn't fit
 */
export function highlightFit(
    highlight: IHighlightCache,
    value: IVal | IEntry,
    maxLength: number,
    settings: IHighlightSettings,
    handlers?: IHoverHandlers
): {fit: IHighlight; noFit: IHighlight | null} {
    let prev = highlight(value, 1, settings, handlers);
    for (let i = 2; i < 10; i++) {
        let newHighlight = highlight(value, i, settings, handlers);
        if (newHighlight.length > maxLength) return {fit: prev, noFit: newHighlight};
        if (!newHighlight.overflow) return {fit: newHighlight, noFit: null};
        prev = newHighlight;
    }
    return {fit: prev, noFit: null};
}
