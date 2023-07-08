import React, {FC, useState, useCallback, useRef, useMemo, useEffect} from "react";
import {AppState} from "../../state/AppState";
import {SearchPanelState} from "../../state/SearchPanelState";
import {PanelContainer} from "../../components/PanelContainer";
import {
    Button,
    IconButton,
    Label,
    Link,
    LinkBase,
    PrimaryButton,
    SearchBox,
    TextField,
    TooltipHost,
    useTheme,
} from "@fluentui/react";
import {useId} from "@fluentui/react-hooks";
import {useDataHook} from "model-react";
import {HoverContextProvider} from "../value/text/HoverContext";
import {ResettingHighlighCache} from "../value/text/HighlightCache";
import TreeView from "react-accessible-treeview";
import {useTreeNodeStyle} from "../value/text/useTreeNodeStyle";
import {useHighlightStyle} from "../value/text/useHighlightStyle";
import {ValueNode} from "../value/text/TextPanel";
import {css} from "@emotion/css";
import {useScrollbarStyle} from "../../utils/useScrollbarStyle";

export const SearchPanel: FC<{panel: SearchPanelState; state: AppState}> = ({
    panel,
    state,
}) => {
    const [h] = useDataHook();
    const stateSearchText = panel.getSearchText(h);
    const [search, setSearchText] = useState(stateSearchText);
    useEffect(() => {
        setSearchText(stateSearchText);
    }, [stateSearchText]);
    const tooltipId = useId("pattern");
    const setSearch = useCallback(() => {
        if (panel.getSearchText() != search) panel.setSearchText(search);
        updateError();
    }, [search]);
    const updateError = useCallback(() => {
        const result = panel.getMatches();
        setError("error" in result ? result.error : "");
    }, [panel]);
    const toggleType = useCallback(() => {
        panel.setSearchType(panel.getSearchType() == "text" ? "value" : "text");
        updateError();
    }, []);
    const [error, setError] = useState("");
    const theme = useTheme();

    const matchTree = panel.getMatchTree(h);

    const sizeRef = useRef<HTMLDivElement>(null);
    const [treeStyleClass, rootRef] = useTreeNodeStyle();
    const highlightStyleClass = useHighlightStyle(state);

    const [showCount, setShowCount] = useState(0);
    useEffect(() => {
        setShowCount(state.getSettings().search.initialLoadCount);
    }, [matchTree]);
    const trimmedMatchTree = useMemo(() => {
        if (!matchTree) return null;
        const included = matchTree.slice(0, showCount);
        const includedSet = new Set(included.map(({id}) => id));
        return included.map(data => ({
            ...data,
            children: data.children.filter(id => includedSet.has(id)),
        }));
    }, [showCount, matchTree]);

    return (
        <PanelContainer
            ref={sizeRef}
            className={`${treeStyleClass} ${highlightStyleClass} ${css({
                display: "flex",
                flexDirection: "column",
            })}`}>
            <div style={{width: "min(100%, 500px)", marginBottom: 10}}>
                <div style={{display: "flex"}}>
                    <SearchBox
                        styles={{root: {flexGrow: 1, paddingRight: 32}}}
                        placeholder="Search"
                        underlined={true}
                        value={search}
                        onChange={v => v?.target && setSearchText(v.target.value)}
                        onClear={() => setSearchText("")}
                        onSearch={setSearch}
                        onBlur={setSearch}
                    />
                    <TooltipHost content="Pattern search" id={tooltipId}>
                        <IconButton
                            style={{marginLeft: -32, height: 30}}
                            iconProps={{iconName: "puzzle"}}
                            aria-label="Regex"
                            onClick={toggleType}
                            checked={panel.getSearchType(h) == "value"}
                        />
                    </TooltipHost>
                </div>
                {error && (
                    <Label style={{color: theme.semanticColors.errorText}}>{error}</Label>
                )}
            </div>

            <div
                className={css({
                    flexGrow: 1,
                    flexShrink: 1,
                    minHeight: 0,
                    overflow: "auto",
                    marginRight: -10,
                    paddingRight: 10,
                    ".tree": {
                        minWidth: "fit-content",
                    },
                    ...useScrollbarStyle(),
                })}>
                <HoverContextProvider state={state}>
                    <ResettingHighlighCache sizeRef={sizeRef}>
                        {trimmedMatchTree?.length && (
                            <TreeView
                                data={trimmedMatchTree}
                                aria-label="text value view"
                                ref={rootRef}
                                expandOnKeyboardSelect
                                nodeRenderer={ValueNode}
                            />
                        )}
                    </ResettingHighlighCache>
                </HoverContextProvider>
                {(trimmedMatchTree?.length ?? 0) < (matchTree?.length ?? 0) && (
                    <>
                        <PrimaryButton
                            style={{marginTop: 10}}
                            onClick={() =>
                                setShowCount(
                                    count =>
                                        count + state.getSettings().search.loadMoreCount
                                )
                            }>
                            Load more results
                        </PrimaryButton>
                    </>
                )}
            </div>
        </PanelContainer>
    );
};
