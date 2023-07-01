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
import {IValNode} from "../../_types/IValNode";
import {IEntry, IVal} from "../../_types/IVal";
import {IHighlight} from "./_types/IHighlight";
import {highlight} from "./highlight";
import {IHoverHandlers} from "./_types/IHoverHandler";

// Based on an in browser measurement in chrome
const pixelsPerChar = 722 / 100;

export const ValueHighlight = forwardRef<
    HTMLDivElement,
    {
        value: IVal | IEntry;
        className?: string;
        onHover?: (value: IVal | null) => void;
        wrapElement?: (node: ReactNode) => ReactNode;
    }
>(({value, className, wrapElement = n => n, onHover}, ref) => {
    // Manage the hover stack and invoking of the callback
    const hoverHandlers = useMemo<IHoverHandlers | undefined>(() => {
        if (!onHover) return undefined;

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
                    const index = hoverStack.indexOf(value);
                    if (index == -1) return;
                    hoverStack.splice(index, 1);
                    const top = hoverStack[hoverStack.length - 1] ?? null;
                    onHover(top);
                },
            };
            map.set(value.id, newHandler);
            return newHandler;
        };
    }, [value, onHover]);

    // Determine the content at the right size, using the highlight function
    const sizeRef = useRef<HTMLDivElement>(null);
    const [content, setContent] = useState<ReactNode>(null);
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

            const {width} = el.getBoundingClientRect();
            if (width == 0) return;

            const maxLength = width / pixelsPerChar;
            if (prevData) {
                const inRange =
                    prevData.fit.length <= maxLength &&
                    (!prevData.noFit || maxLength < prevData.noFit.length);
                if (inRange) return;
            }

            const highlightData = highlightFit(value, maxLength, hoverHandlers);
            // const highlightData = highlight(value, 2);
            prevData = highlightData;
            setContent(highlightData.fit.el);
        }
        calculate();

        const observer = new ResizeObserver(calculate);
        observer.observe(el);
        return () => observer.disconnect();
    }, [value, hoverHandlers]);

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
 * @param value The value to be highlighted
 * @param maxLength The maximum number of characters
 * @returns The highlighting data that does fit, and the next data that doesn't fit
 */
export function highlightFit(
    value: IVal | IEntry,
    maxLength: number,
    handlers?: IHoverHandlers
): {fit: IHighlight; noFit: IHighlight | null} {
    let prev = highlight(value, 1);
    for (let i = 2; i < 100; i++) {
        let newHighlight = highlight(value, i, handlers);
        if (!newHighlight.overflow) return {fit: newHighlight, noFit: null};
        if (newHighlight.length > maxLength) return {fit: prev, noFit: newHighlight};
        prev = newHighlight;
    }
    return {fit: prev, noFit: null};
}
