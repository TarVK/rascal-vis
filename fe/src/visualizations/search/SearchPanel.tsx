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
import {HoverContextProvider} from "../text/HoverContext";
import {ResettingHighlighCache} from "../text/HighlightCache";
import TreeView from "react-accessible-treeview";
import {useTreeNodeStyle} from "../text/useTreeNodeStyle";
import {useHighlightStyle} from "../text/useHighlightStyle";
import {ValueNode} from "../text/TextPanel";
import {css} from "@emotion/css";
import {useScrollbarStyle} from "../../utils/useScrollbarStyle";

export const SearchPanel: FC<{panel: SearchPanelState; state: AppState}> = ({
    panel,
    state,
}) => {
    const [h] = useDataHook();
    const [search, setSearchText] = useState("");
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
    const increment = 50;
    useEffect(() => {
        setShowCount(50);
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
            <div style={{width: "min(100%, 300px)", marginBottom: 10}}>
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
                            onClick={() => setShowCount(count => count + increment)}>
                            Load more results
                        </PrimaryButton>
                    </>
                )}
            </div>
        </PanelContainer>
    );
};
