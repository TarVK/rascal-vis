import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {PanelContainer} from "../../../components/PanelContainer";
import {AppState} from "../../../state/AppState";
import {GrammarValueState} from "../../../state/valueTypes/GrammarValueState";
import {useGrammarInteractionHandler} from "./useGrammarInteractionHandler";
import {
    IGrammarClickData,
    IGrammarInteractionHandler,
} from "./_types/IGrammarInteractionHandler";
import {
    IGrammarProduction,
    IGrammarSymbol,
} from "../../../state/valueTypes/_types/IGrammarData";
import {highlightSymbol} from "./highlightSymbol";
import {highlightProduction} from "./highlightProduction";
import {useDataHook} from "model-react";
import {useHighlightStyle} from "./useHighlightStyle";
import {css} from "@emotion/css";
import {IValNode} from "../../../_types/IValNode";
import {IContextualMenuItem} from "@fluentui/react";
import {StyledContextMenu} from "../../../components/StyledContextMenu";
import {copy} from "../../../utils/copy";
import {ASTtoText} from "../../../value/ASTtoText";
import {useAppState} from "../../../state/StateContext";
import {IGrammarExpansionData} from "./_types/IGrammarExpansionData";
import {useGrammarExpandHandler} from "./useGrammarExpandHandler";

export const GrammarPanel: FC<{state: AppState; grammarState: GrammarValueState}> = ({
    state,
    grammarState,
}) => {
    const [h] = useDataHook();
    const highlightStyle = useHighlightStyle(state);

    const settings = state.getSettings(h).grammar;

    return (
        <PanelContainer
            className={`${highlightStyle} ${css({
                paddingRight: 70,
                ".grammarDefinitionSymbol": {
                    minWidth: settings.alignWidth,
                },
            })}`}>
            <GrammarComp state={state} grammarState={grammarState} />
        </PanelContainer>
    );
};

export const GrammarComp: FC<{state: AppState; grammarState: GrammarValueState}> = ({
    state,
    grammarState,
}) => {
    const [h] = useDataHook();
    const grammar = grammarState.grammar.get(h);
    const hoverHighlight = state.getSettings(h).text.hoverHighlightIntensity != 0;

    const [contextMenuTarget, setContextMenuTarget] = useState<MouseEvent | null>(null);
    const [contextTargetValue, setContextTargetValue] =
        useState<IGrammarClickData | null>(null);
    const onHideContextMenu = useCallback(() => setContextMenuTarget(null), []);
    const contextMenu = useMemo<IContextualMenuItem[]>(() => {
        if (contextTargetValue && grammar) {
            const {source} = contextTargetValue;
            const {value} = source;
            const highlighted = state.getHighlight()?.id == value.id;
            const rule = grammar.rules.find(rule => rule.key.source.value == value);
            return [
                {
                    key: "open",
                    text: "Open in new tab",
                    iconProps: {iconName: "OpenPaneMirrored"},
                    onClick: () => void state.openNode(source),
                },
                ...(rule
                    ? [
                          {
                              key: "open definition",
                              text: "Open definition in new tab",
                              iconProps: {iconName: "OpenPaneMirrored"},
                              onClick: () => void state.openNode(rule.source),
                          },
                      ]
                    : []),
                {
                    key: "copy",
                    text: "Copy value text",
                    iconProps: {iconName: "Copy"},
                    onClick: () => copy(ASTtoText("key" in value ? value.value : value)),
                },
                {
                    key: "focus",
                    text: "Focus on value",
                    iconProps: {iconName: "OpenFolderHorizontal"},
                    onClick: () => {
                        state.reveal(value);
                        state.setHighlight(value);
                    },
                },
                ...(rule
                    ? [
                          {
                              key: "focus definition",
                              text: "Focus on definition",
                              iconProps: {iconName: "OpenFolderHorizontal"},
                              onClick: () => {
                                  state.revealNodes([rule.key.source]);
                                  state.setHighlight(rule.source.value);
                              },
                          },
                      ]
                    : []),
                {
                    checked: highlighted,
                    canCheck: highlighted,
                    key: "highlight",
                    text: "Highlight value",
                    iconProps: {iconName: "FabricTextHighlight"},
                    onClick: () =>
                        highlighted
                            ? state.setHighlight(null)
                            : state.setHighlight(value),
                },
                {
                    key: "collapseAll",
                    text: "Collapse all symbols",
                    iconProps: {iconName: "CaretRightSolid8"},
                    onClick: () => grammarState.setExpanded(new Set()),
                },
                {
                    key: "expandAll",
                    text: "Expand all symbols",
                    iconProps: {iconName: "CaretDownSolid8"},
                    onClick: () => grammarState.expandAll(),
                },
            ];
        }
        return [];
    }, [contextTargetValue, contextMenuTarget]);

    const interactionHandler = useGrammarInteractionHandler(
        useCallback(
            (value, valueData) => {
                if (!grammar) return;
                const rule = grammar.rules.find(
                    rule => rule.key.source.value == value.value
                );
                if (rule) {
                    state.revealNodes([rule.key.source]);
                    const val = rule.source.value;
                    state.setHighlight(val);
                } else {
                    const val = value.value;
                    state.setHighlight(val);
                }
            },
            [state]
        ),
        useCallback(
            (value, valueData, mouse) => {
                setContextTargetValue(valueData);
                setContextMenuTarget(mouse.nativeEvent);
            },
            [state, grammar]
        ),
        useCallback(
            (value, valueData) => {
                if (!hoverHighlight) return;
                const val = value?.value;
                if (!val) state.setHoverHighlight(null);
                else if (!("key" in val)) state.setHoverHighlight(val);
            },
            [
                state,
                hoverHighlight,
                // mouseleave may not trigger if element is changed by expansion
                grammarState.getExpanded(h),
            ]
        )
    );
    const expandHandler = useGrammarExpandHandler(grammarState);
    if (!grammar) return <></>;

    const starts = grammar.start.map(({source}) => source.value);
    return (
        <div>
            {grammar.rules
                .sort(({key}, b) => (starts.includes(key.source.value) ? -1 : 0))
                .filter(
                    ({key}) =>
                        !(
                            key.type == "start" ||
                            key.type == "empty" ||
                            (key.type == "layouts" && key.name[0] == "$default$")
                        )
                )
                .map(({key, value, source}) => (
                    <ProductionComp
                        key={key.source.id}
                        handler={interactionHandler}
                        expandHandler={expandHandler}
                        symbol={key}
                        production={value}
                        source={source}
                        start={starts.includes(key.source.value)}
                    />
                ))}

            <StyledContextMenu
                items={contextMenu}
                hidden={!contextMenuTarget}
                target={contextMenuTarget}
                onItemClick={onHideContextMenu}
                onDismiss={onHideContextMenu}
            />
        </div>
    );
};

export const ProductionComp: FC<{
    handler: IGrammarInteractionHandler;
    expandHandler: IGrammarExpansionData;
    production: IGrammarProduction;
    symbol: IGrammarSymbol;
    source: IValNode;
    start: boolean;
}> = ({handler, expandHandler, production, symbol, source, start}) => {
    const state = useAppState();
    const [h] = useDataHook();
    const settings = state.getSettings(h).grammar;

    const label =
        symbol.type == "sort"
            ? "syntax"
            : symbol.type == "lex"
            ? "lexical"
            : symbol.type == "layouts"
            ? "layout"
            : symbol.type == "keywords"
            ? "keyword"
            : undefined;

    const symbolHighlight = useMemo(
        () =>
            highlightSymbol(
                symbol,
                label ? {...settings, showLayout: true} : settings,
                null,
                handler
            ),
        [symbol, settings, handler]
    );

    const productionHighlight = useMemo(
        () => highlightProduction(production, settings, expandHandler, handler),
        [production, settings, expandHandler, handler]
    );
    // const shouldDedent = (prod: IGrammarProduction): boolean =>
    //     (prod.type == "priority" || prod.type == "choice") &&
    //     (prod.alternatives.length > 1 ||
    //         (prod.alternatives.length == 1 && shouldDedent(prod.alternatives[0])));
    // const dedent = shouldDedent(production);
    const dedent = production.type == "priority" || production.type == "choice";

    return (
        <div style={{display: "flex", alignItems: "flex-start"}}>
            <div
                className="grammarDefinitionSymbol"
                style={{
                    display: "flex",
                    marginRight: dedent ? -15 : 5,
                    gap: 5,
                    // flexShrink: 0,
                }}>
                <span
                    style={
                        start
                            ? {
                                  fontStyle: "italic",
                                  fontWeight: 900,
                              }
                            : undefined
                    }>
                    <span className="keyword">{label}</span>{" "}
                    <span
                        style={{
                            cursor: "pointer",
                            wordBreak: "break-all",
                        }}
                        className={`symbol`}
                        id={source.value.id + ""}>
                        {symbolHighlight}
                    </span>
                </span>
                <div style={{flexGrow: 1, textAlign: "right"}} className="glyph">
                    =
                </div>
            </div>
            <span
                className="grammarDefinition"
                style={{cursor: "pointer", minWidth: "70%"}}>
                {productionHighlight}
            </span>
        </div>
    );
};
