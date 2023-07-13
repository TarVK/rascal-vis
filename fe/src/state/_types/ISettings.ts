export type ISettings = {
    /** Layout related settings */
    layout: {
        /** Whether to delete panels when they no longer contain a value */
        deleteUnusedPanels: boolean;
    };
    /** Text visualization related settings */
    text: {
        /** The opacity for the hover highlighting */
        hoverHighlightIntensity: number;
        /** The opacity for the selection highlighting */
        highlightIntensity: number;
        /** Whether to show the size of collections */
        showCollectionSizes: {
            set: boolean;
            tuple: boolean;
            map: boolean;
            list: boolean;
        };
    };
    /** Graph visualization related settings */
    graph: {
        /** The rendering sharpness to use */
        sharpness: number;
    };
    /** Search related settings */
    search: {
        /** How many entries to initially load */
        initialLoadCount: number;
        /** How many entries to load per press */
        loadMoreCount: number;
    };
    /** Grammar settings */
    grammar: {
        /** Whether to show layout insertions */
        showLayout: boolean;
        /** Minimum LHS width for better alignment */
        alignWidth: number;
    };
};
