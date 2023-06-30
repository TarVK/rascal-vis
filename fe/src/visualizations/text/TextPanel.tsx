import React, {FC, useRef, useEffect, useState} from "react";
import TreeView, {INode, flattenTree} from "react-accessible-treeview";
import {PanelState} from "../../state/PanelState";
import {PanelContainer} from "../../components/PanelContainer";
import {usePersistentMemo} from "../../utils/usePersistentMemo";
import {css} from "@emotion/css";
import {INodeRole, IValNode} from "../../_types/IValNode";
import {ValueHighlight} from "./ValueHighlight";
import {highlightTheme} from "./highlightTheme";
import {FontIcon, useTheme} from "@fluentui/react";

export const TextPanel: FC<{panel: PanelState}> = ({panel}) => {
    const nodes = panel.valueNodes;
    const theme = useTheme();
    const indentLevel = 15;

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

    return (
        <PanelContainer
            className={css({
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
            })}>
            <TreeView
                data={nodes}
                aria-label="text value view"
                ref={root}
                expandOnKeyboardSelect
                nodeRenderer={({
                    element,
                    getNodeProps,
                    level,
                    handleSelect,
                    isExpanded,
                }) => {
                    if (!isValNode(element)) return <></>;
                    const inheritProps = getNodeProps();
                    return (
                        <div
                            {...inheritProps}
                            className={`${css({
                                display: "flex",
                                alignItems: "center",
                            })} ${inheritProps.className}`}>
                            <div style={{width: level * indentLevel}} />
                            <span
                                style={{width: 15, fontSize: 10, cursor: "pointer"}}
                                className="arrow">
                                {!!element.children.length && (
                                    <span
                                        style={{
                                            transform: isExpanded
                                                ? "rotate(90deg)"
                                                : undefined,
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
                            />
                        </div>
                    );
                }}
            />
        </PanelContainer>
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
