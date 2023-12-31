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
import {ValuePanelState} from "../../../state/ValuePanelState";
import {PanelContainer} from "../../../components/PanelContainer";
import {usePersistentMemo} from "../../../utils/usePersistentMemo";
import {css} from "@emotion/css";
import {INodeRole, IValNode} from "../../../_types/IValNode";
import {ValueHighlight} from "./ValueHighlight";
import {
    ContextualMenu,
    FontIcon,
    IContextualMenuItem,
    Link,
    useTheme,
} from "@fluentui/react";
import {ASTtoText} from "../../../value/ASTtoText";
import {copy} from "../../../utils/copy";
import {StateContext, useAppState} from "../../../state/StateContext";
import {AppState} from "../../../state/AppState";
import {useDragStart} from "../../../utils/useDragStart";
import {getName} from "../../../value/getName";
import {useDataHook} from "model-react";
import {IVal} from "../../../_types/IVal";
import {HighlightCache, ResettingHighlighCache} from "./HighlightCache";
import {IHoverHandlers} from "./_types/IHoverHandler";
import {HoverContextProvider, useHoverHandlers} from "./HoverContext";
import {useTreeNodeStyle} from "./useTreeNodeStyle";
import {useHighlightStyle} from "./useHighlightStyle";
import {useValueDrag} from "./useValueDrag";
import {StyledContextMenu} from "../../../components/StyledContextMenu";
import {PlainValueState} from "../../../state/valueTypes/PlainValueState";
import {useExpandState} from "./useExpandSync";

export const TextPanel: FC<{
    panel: ValuePanelState;
    state: AppState;
    textState: PlainValueState;
}> = ({panel, textState, state}) => {
    const [h] = useDataHook();
    const nodes = panel.getValueNodes(h);

    const [treeStyleClass, rootRef] = useTreeNodeStyle();
    const highlightStyleClass = useHighlightStyle(state);
    const sizeRef = useRef<HTMLDivElement>(null);

    const [expandNodes, onExpand] = useExpandState(panel, textState);

    if (nodes.length == 0)
        return (
            <PanelContainer>
                No value specified, see the{" "}
                <Link
                    onClick={() => {
                        state.specialTabs.open(state.specialTabs.input);
                    }}>
                    input panel
                </Link>
            </PanelContainer>
        );

    return (
        <PanelContainer
            ref={sizeRef}
            className={`${treeStyleClass} ${highlightStyleClass} ${css({
                paddingRight: 70,
            })}`}>
            <HoverContextProvider state={state}>
                <ResettingHighlighCache sizeRef={sizeRef}>
                    <TreeView
                        data={nodes}
                        aria-label="text value view"
                        ref={rootRef}
                        expandedIds={expandNodes}
                        expandOnKeyboardSelect
                        nodeRenderer={ValueNode}
                        onExpand={onExpand}
                    />
                </ResettingHighlighCache>
            </HoverContextProvider>
        </PanelContainer>
    );
};

export const ValueNode: (props: INodeRendererProps) => ReactNode = ({
    element,
    getNodeProps,
    level,
    isExpanded,
}) => {
    if (!isValNode(element)) return <></>;

    const [h] = useDataHook();
    const {value} = element;
    const state = useAppState();
    const dragRef = element.notOpenable ? undefined : useValueDrag(element, state);

    const inheritProps = getNodeProps();
    const indentLevel = 15;

    const highlighted = state.getHighlight()?.id == value.id;

    const [contextMenuTarget, setContextMenuTarget] = useState<MouseEvent | null>(null);
    const onShowContextMenu = useCallback((e: RMouseEvent) => {
        setContextMenuTarget(e.nativeEvent);
        e.preventDefault();
    }, []);
    const onHideContextMenu = useCallback(() => setContextMenuTarget(null), []);
    const contextMenu = useMemo<IContextualMenuItem[]>(() => {
        const out: IContextualMenuItem[] = [];
        if (!element.notOpenable)
            out.push({
                key: "open",
                text: "Open in new tab",
                iconProps: {iconName: "OpenPaneMirrored"},
                onClick: () => void state.openNode(element),
            });
        out.push(
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
            }
        );
        if (!("key" in value))
            out.push({
                checked: highlighted,
                canCheck: highlighted,
                key: "highlight",
                text: "Highlight value",
                iconProps: {iconName: "FabricTextHighlight"},
                onClick: () =>
                    highlighted ? state.setHighlight(null) : state.setHighlight(value),
            });
        if (element?.controls?.context) out.push(...element?.controls?.context);

        return out;
    }, [element, highlighted]);

    const hoverHandlers = useHoverHandlers();
    return (
        <div
            {...inheritProps}
            className={`${css({
                display: "flex",
                alignItems: "center",
            })} ${inheritProps.className}`}
            onContextMenu={onShowContextMenu}>
            <div style={{width: level * indentLevel, flexShrink: 0}} />
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
                settings={state.getSettings(h).text}
                ref={dragRef}
            />

            {element.controls?.inline}

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
