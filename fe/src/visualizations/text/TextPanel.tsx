import React, {
    FC,
    useRef,
    useEffect,
    useState,
    useMemo,
    ReactNode,
    useCallback,
    MouseEventHandler,
    createContext,
    useContext,
    useLayoutEffect,
    MouseEvent as RMouseEvent,
} from "react";
import TreeView, {
    INode,
    INodeRendererProps,
    flattenTree,
} from "react-accessible-treeview";
import {PanelState} from "../../state/PanelState";
import {PanelContainer} from "../../components/PanelContainer";
import {usePersistentMemo} from "../../utils/usePersistentMemo";
import {css} from "@emotion/css";
import {INodeRole, IValNode} from "../../_types/IValNode";
import {ValueHighlight} from "./ValueHighlight";
import {highlightTheme} from "./highlightTheme";
import {ContextualMenu, FontIcon, IContextualMenuItem, useTheme} from "@fluentui/react";
import {ASTtoText} from "../../parse/ASTtoText";
import {copy} from "../../utils/copy";
import {StateContext, useAppState} from "../../state/StateContext";
import {AppState} from "../../state/AppState";
import {useDragStart} from "../../utils/useDragStart";
import {getName} from "../../parse/getName";
import {useDataHook} from "model-react";
import {IVal} from "../../_types/IVal";
import {HighlightCache} from "./HighlightCache";
import {IHoverHandlers} from "./_types/IHoverHandler";

export const TextPanel: FC<{panel: PanelState; state: AppState}> = ({panel, state}) => {
    const nodes = panel.valueNodes;
    const theme = useTheme();

    // Handle keyboard selection visualization
    const [keyboardSelect, setKeyboardSelect] = useState(false);
    const root = useRef<HTMLUListElement>(null);
    useEffect(() => {
        const el = root.current;
        if (!el) return;

        const keyListener = () => setKeyboardSelect(true);
        const clickListener = () => setKeyboardSelect(false);
        el.addEventListener("keydown", keyListener);
        el.addEventListener("mousedown", clickListener);
        return () => {
            el.removeEventListener("keydown", keyListener);
            el.removeEventListener("mousedown", clickListener);
        };
    }, [root]);

    // Handle highlighting visualization
    const [h] = useDataHook();
    const highlight = state.getHighlight(h);
    const hoverHighlight = state.getHoverHighlight(h);

    const onHover = useCallback(
        (val: IVal | null) => state.setHoverHighlight(val),
        [state]
    );
    const hoverHandlers = useMemo<IHoverHandlers>(() => {
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
                    const index = hoverStack.lastIndexOf(value);
                    if (index == -1) return;
                    hoverStack.splice(index, 1);
                    const top = hoverStack[hoverStack.length - 1] ?? null;
                    onHover(top);
                },
            };
            map.set(value.id, newHandler);
            return newHandler;
        };
    }, [onHover]);

    const [highlightCacheId, setHighlightCacheId] = useState(0);
    const sizeRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const el = sizeRef.current;
        if (!el) return;

        const observer = new ResizeObserver(() => setHighlightCacheId(id => id + 1));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Handle revealing
    const [revealNodes, setRevealNodes] = useState<(string | number)[]>([]);
    useEffect(
        () =>
            panel.addOnReveal(nodes => {
                console.log(nodes);
                setRevealNodes([-1, ...[...nodes].map(node => node.id)]);
            }),
        [panel]
    );

    return (
        <PanelContainer
            ref={sizeRef}
            className={`${css({
                // Remove default styling
                ".tree,.tree-node,.tree-node-group": {
                    padding: 0,
                    margin: 0,
                    listStyle: "none",
                },
                ".tree-branch-wrapper,.tree-node__leaf": {
                    outline: "none",
                },

                // Add custom styling
                ".tree-node": {
                    cursor: "pointer",
                },
                ".tree-node--focused": {
                    background: keyboardSelect
                        ? theme.palette.neutralLight
                        : theme.palette.neutralLighterAlt,
                    color: "orange",
                },
                fontFamily: "consolas",
                ...highlightTheme(theme),
            })} ${
                highlight
                    ? css({
                          [`.value[id='${highlight.id}']`]: {
                              backgroundColor: theme.palette.themeTertiary,
                          },
                      })
                    : undefined
            } ${
                hoverHighlight
                    ? css({
                          [`.value[id='${hoverHighlight.id}']`]: {
                              position: "relative",
                              zIndex: 1,
                              "&:before": {
                                  backgroundColor: theme.palette.themeTertiary,
                                  opacity: 0.3,
                                  zIndex: -1,
                                  position: "absolute",
                                  display: "block",
                                  content: "''",
                                  top: 0,
                                  bottom: 0,
                                  right: 0,
                                  left: 0,
                              },
                          },
                      })
                    : undefined
            }`}>
            <HoverContext.Provider value={hoverHandlers}>
                <StateContext.Provider value={state}>
                    <HighlightCache cacheKey={highlightCacheId}>
                        <TreeView
                            data={nodes}
                            aria-label="text value view"
                            ref={root}
                            expandedIds={revealNodes}
                            expandOnKeyboardSelect
                            nodeRenderer={ValueNode}
                        />
                    </HighlightCache>
                </StateContext.Provider>
            </HoverContext.Provider>
        </PanelContainer>
    );
};

const ValueNode: (props: INodeRendererProps) => ReactNode = ({
    element,
    getNodeProps,
    level,
    isExpanded,
}) => {
    const state = useAppState();
    const theme = useTheme();
    const dragRef = useDragStart((start, offset, target) => {
        if (!isValNode(element)) return;
        const tab = state.openNode(element, false);
        if (!(target instanceof HTMLElement)) return;

        const width = target.getBoundingClientRect().width;
        if (tab) {
            const layoutState = state.getLayoutState();
            layoutState.setDraggingData({
                position: start,
                offset,
                targetId: tab.getID(),
                preview: (
                    <ValueHighlight
                        value={element.value}
                        className={css({
                            width,
                            ".wrapper": {
                                backgroundColor: theme.palette.neutralLighter,
                                display: "inline-block",
                            },
                            ...highlightTheme(theme),
                        })}
                        wrapElement={text => <div className="wrapper">{text}</div>}
                    />
                ),
            });
            layoutState.addCloseHandler(tab.getID(), () => state.removePanel(tab));
        }
    });

    if (!isValNode(element)) return <></>;
    const inheritProps = getNodeProps();
    const indentLevel = 15;

    // const [h] = useDataHook();
    const {value} = element;
    const highlighted = state.getHighlight()?.id == value.id;

    const [contextMenuTarget, setContextMenuTarget] = useState<MouseEvent | null>(null);
    const onShowContextMenu = useCallback((e: RMouseEvent) => {
        setContextMenuTarget(e.nativeEvent);
        e.preventDefault();
    }, []);
    const onHideContextMenu = useCallback(() => setContextMenuTarget(null), []);
    const contextMenu = useMemo<IContextualMenuItem[]>(
        () => [
            {
                key: "open",
                text: "Open in new tab",
                iconProps: {iconName: "OpenPaneMirrored"},
                onClick: () => state.openNode(element),
            },
            {
                key: "copy",
                text: "Copy value text",
                iconProps: {iconName: "Copy"},
                onClick: () =>
                    copy(
                        ASTtoText(
                            "key" in element.value ? element.value.value : element.value
                        )
                    ),
            },
            {
                key: "focus",
                text: "Focus on value",
                iconProps: {iconName: "OpenFolderHorizontal"},
                onClick: () => {
                    state.reveal(value);
                    if (!("key" in value)) state.setHighlight(value);
                },
            },
            ...("key" in value
                ? []
                : [
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
                  ]),
        ],
        [element, highlighted]
    );

    const hoverHandlers = useContext(HoverContext);
    return (
        <div
            {...inheritProps}
            className={`${css({
                display: "flex",
                alignItems: "center",
            })} ${inheritProps.className}`}
            onContextMenu={onShowContextMenu}>
            <div style={{width: level * indentLevel}} />
            <span style={{width: 15, fontSize: 10, cursor: "pointer"}} className="arrow">
                {!!element.children.length && (
                    <span
                        style={{
                            transform: isExpanded ? "rotate(90deg)" : undefined,
                            display: "inline-block",
                        }}>
                        <FontIcon iconName="CaretRightSolid8" />
                    </span>
                )}
            </span>
            {getRoleElement(element.role ?? null)}

            <ValueHighlight
                value={element.value}
                className={css({flexGrow: 1})}
                hoverHandlers={hoverHandlers}
                minWidth={300}
                ref={dragRef}
            />

            <ContextualMenu
                items={contextMenu}
                hidden={!contextMenuTarget}
                target={contextMenuTarget}
                onItemClick={onHideContextMenu}
                onDismiss={onHideContextMenu}
            />
        </div>
    );
};

function isValNode(node: INode): node is IValNode {
    return "value" in node;
}

function getRoleElement(role: INodeRole | null): JSX.Element {
    if (!role) return <></>;
    return (
        <span className="label" style={{marginRight: 7}}>
            {role.type == "key"
                ? "key: "
                : role.type == "value"
                ? "value: "
                : role.type == "index"
                ? role.index + ": "
                : role.name + ": "}
        </span>
    );
}

const HoverContext = createContext<IHoverHandlers | undefined>(undefined);
