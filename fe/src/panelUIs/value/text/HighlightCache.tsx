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
import {IEntry, IVal} from "../../../_types/IVal";
import {IHoverHandlers} from "./_types/IHoverHandler";
import {IHighlightSettings} from "./_types/IHighlightSettings";

export const highlightCacheContext = createContext<IHighlightCache>(
    (value, maxLength, settings, hover) => highlight(value, maxLength, settings, hover)
);
export const useHighlightCache = () => useContext(highlightCacheContext);

export const HighlightCache: FC<{
    /** The key, such that if the key changes, the cache is reset */
    cacheKey?: any;
}> = ({children, cacheKey}) => {
    const cachedHighlight = useMemo<IHighlightCache>(() => {
        const cache = new Map<
            IVal | IEntry,
            Map<
                IHoverHandlers | undefined,
                Map<number, Map<IHighlightSettings, IHighlight>>
            >
        >();

        return (value, maxLength, settings, hoverHandlers) => {
            if (!cache.has(value)) cache.set(value, new Map());

            const cache2 = cache.get(value)!;
            if (!cache2.has(hoverHandlers)) cache2.set(hoverHandlers, new Map());

            const cache3 = cache2.get(hoverHandlers)!;
            if (!cache3.has(maxLength)) cache3.set(maxLength, new Map());

            const cache4 = cache3.get(maxLength)!;
            if (cache4.has(settings)) return cache4.get(settings)!;

            const h = highlight(value, maxLength, settings, hoverHandlers);
            cache4.set(settings, h);
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
