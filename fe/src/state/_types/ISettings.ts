export type ISettings = {
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
    /** Search related settings */
    search: {
        /** How many entries to initially load */
        initialLoadCount: number;
        /** How many entries to load per press */
        loadMoreCount: number;
    };
};
