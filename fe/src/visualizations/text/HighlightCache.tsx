import React, {
    FC,
    createContext,
    useContext,
    useMemo,
    memo,
    useState,
    useRef,
    useLayoutEffect,
    RefObject,
} from "react";
import {IHighlightCache} from "./_types/IHighlightCache";
import {highlight} from "./highlight";
import {IHighlight} from "./_types/IHighlight";
import {IEntry, IVal} from "../../_types/IVal";
import {IHoverHandlers} from "./_types/IHoverHandler";

export const highlightCacheContext = createContext<IHighlightCache>(
    (value, maxLength, hover) => highlight(value, maxLength, hover)
);
export const useHighlightCache = () => useContext(highlightCacheContext);

export const HighlightCache: FC<{
    /** The key, such that if the key changes, the cache is reset */
    cacheKey?: any;
}> = ({children, cacheKey}) => {
    const cachedHighlight = useMemo<IHighlightCache>(() => {
        const cache = new Map<
            IVal | IEntry,
            Map<IHoverHandlers | undefined, Map<number, IHighlight>>
        >();

        return (value, maxLength, hoverHandlers) => {
            if (!cache.has(value)) cache.set(value, new Map());

            const cache2 = cache.get(value)!;
            if (!cache2.has(hoverHandlers)) cache2.set(hoverHandlers, new Map());

            const cache3 = cache2.get(hoverHandlers)!;
            if (cache3.has(maxLength)) {
                // console.count("hit");
                return cache3.get(maxLength)!;
            }
            // console.count("miss");

            const h = highlight(value, maxLength, hoverHandlers);
            cache3.set(maxLength, h);
            return h;
        };
    }, [cacheKey]);

    return (
        <highlightCacheContext.Provider value={cachedHighlight}>
            {children}
        </highlightCacheContext.Provider>
    );
};

export const ResettingHighlighCache: FC<{sizeRef: RefObject<HTMLDivElement>}> = ({
    children,
    sizeRef,
}) => {
    const [highlightCacheId, setHighlightCacheId] = useState(0);
    useLayoutEffect(() => {
        const el = sizeRef.current;
        if (!el) return;

        const observer = new ResizeObserver(() => setHighlightCacheId(id => id + 1));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return <HighlightCache cacheKey={highlightCacheId}>{children}</HighlightCache>;
};
