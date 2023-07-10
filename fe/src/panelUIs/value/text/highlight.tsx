import React, {FC, Fragment, useRef, useLayoutEffect, ReactNode, useState} from "react";
import {IEntry, IVal} from "../../../_types/IVal";
import {IHighlight} from "./_types/IHighlight";
import {IHoverHandlers} from "./_types/IHoverHandler";
import {IHighlightSettings} from "./_types/IHighlightSettings";
import {
    siteControlsContructorNames,
    visualizationContructorNames,
} from "../../../value/specialConstructors";

/**
 * Retrieves the highlighted text fora  given value
 * @param value The value to be highlighted
 * @param remainingDepth The remaining depth to be expanded
 * @param settings The highlight settings
 * @param hoverHandler The value hover handlers
 * @returns The highlighted text el and character count
 */
export function highlight(
    value: IVal | IEntry,
    remainingDepth: number,
    settings: IHighlightSettings,
    hoverHandler?: IHoverHandlers
): IHighlight {
    const rec = (value: IVal | IEntry) =>
        highlight(value, remainingDepth - 1, settings, hoverHandler);
    const baseSymbol = (text: string, type: string, id?: number) => {
        const hasId = id != undefined;
        return {
            length: text.length,
            el: (
                <span
                    className={type}
                    id={id + ""}
                    onMouseEnter={hasId ? handlers?.onEnter : undefined}
                    onMouseLeave={hasId ? handlers?.onLeave : undefined}>
                    {text}
                </span>
            ),
            overflow: false,
        };
    };
    const join = (nodes: IHighlight[], sep: IHighlight): IHighlight[] =>
        nodes.flatMap(node => [sep, node]).slice(1);
    const collapse = (ided: boolean = true) => ({
        ...baseSymbol(
            "...",
            "collapse" + (ided ? " value" : ""),
            ided ? value.id : undefined
        ),
        overflow: true,
    });
    const handlers = "key" in value ? undefined : hoverHandler?.(value);

    if ("key" in value) {
        if (remainingDepth == 0) return collapse();
        const {length: keyLength, el: keyEl, overflow: ko} = rec(value.key);
        const {length: sepLength, el: sepEl} = baseSymbol(": ", "symbol");
        const {length: valueLength, el: valueEl, overflow: vo} = rec(value.value);
        return {
            length: keyLength + sepLength + valueLength,
            el: (
                <>
                    {keyEl}
                    {sepEl}
                    {valueEl}
                </>
            ),
            overflow: ko || vo,
        };
    } else if (value.type == "constr" || value.type == "node") {
        if (remainingDepth == 0) return collapse();
        const optGreyOut =
            value.type == "constr" && siteControlsContructorNames.includes(value.name)
                ? "greyOut"
                : "";
        const optHighlight =
            value.type == "constr" && visualizationContructorNames.includes(value.name)
                ? "highlight"
                : "";

        const {length: nameLength, el: nameEl} = baseSymbol(
            value.name,
            `identifier ${optGreyOut} ${optHighlight}`
        );
        const {length: openLength, el: openEl} = baseSymbol("(", "symbol");
        const indexedChildren = value.children.map(rec);
        const namedChildren = value.namedChildren.map(({name, value}) => {
            const {length: nameLength, el: nameEl} = baseSymbol(name, "name");
            const {length: sepLength, el: sepEl} = baseSymbol("=", "symbol");
            const {length: childLength, el: childEl, overflow} = rec(value);
            return {
                length: nameLength + sepLength + childLength,
                el: (
                    <>
                        {nameEl}
                        {sepEl}
                        {childEl}
                    </>
                ),
                overflow,
            };
        });
        const joinedChildren = join(
            [...indexedChildren, ...namedChildren],
            baseSymbol(", ", "symbol")
        );
        const {length: closeLength, el: closeEl} = baseSymbol(")", "symbol");
        return {
            length:
                nameLength +
                openLength +
                joinedChildren.reduce((a, {length: b}) => a + b, 0) +
                closeLength,
            el: (
                <span
                    className="value"
                    id={value.id + ""}
                    onMouseEnter={handlers?.onEnter}
                    onMouseLeave={handlers?.onLeave}>
                    {nameEl}
                    {openEl}
                    {joinedChildren.map(({el: el}, i) => (
                        <Fragment key={i}>{el}</Fragment>
                    ))}
                    {closeEl}
                </span>
            ),
            overflow: joinedChildren.some(({overflow}) => overflow),
        };
    } else if (value.type == "map") {
        if (remainingDepth == 0) return collapse();
        if (remainingDepth == 2) {
            // Would result in `(...: ..., ...: ...)`, we prefer `(..., ..., ...)` instead
            remainingDepth = 1;
        }

        const {length: openLength, el: openEl} = baseSymbol("(", "symbol");
        const {length: closeLength, el: closeEl} = baseSymbol(")", "symbol");
        const joinedChildren = join(value.children.map(rec), baseSymbol(", ", "symbol"));

        const {length: countLength, el: countEl} = settings.showCollectionSizes[
            value.type
        ]
            ? baseSymbol(`(${value.children.length})`, "count")
            : {length: 0, el: undefined};

        return {
            length:
                countLength +
                openLength +
                joinedChildren.reduce((a, {length: b}) => a + b, 0) +
                closeLength,
            el: (
                <span
                    className="value"
                    id={value.id + ""}
                    onMouseEnter={handlers?.onEnter}
                    onMouseLeave={handlers?.onLeave}>
                    {countEl}
                    {openEl}
                    {joinedChildren.map(({el: el}, i) => (
                        <Fragment key={i}>{el}</Fragment>
                    ))}
                    {closeEl}
                </span>
            ),
            overflow: joinedChildren.some(({overflow}) => overflow),
        };
    } else if (value.type == "list" || value.type == "set" || value.type == "tuple") {
        const brackets =
            value.type == "set"
                ? {o: "{", c: "}"}
                : value.type == "tuple"
                ? {o: "<", c: ">"}
                : {o: "[", c: "]"};
        const {length: countLength, el: countEl} = settings.showCollectionSizes[
            value.type
        ]
            ? baseSymbol(`(${value.children.length})`, "count")
            : {length: 0, el: undefined};

        const {length: openLength, el: openEl} = baseSymbol(brackets.o, "symbol");
        const {length: closeLength, el: closeEl} = baseSymbol(brackets.c, "symbol");

        if (remainingDepth == 0) {
            // Still show the size and type, instead of only dots
            const {length: collapseLength, el: collapseEl} = collapse(false);
            return {
                length: countLength + openLength + collapseLength + closeLength,
                el: (
                    <span
                        className="value"
                        id={value.id + ""}
                        onMouseEnter={handlers?.onEnter}
                        onMouseLeave={handlers?.onLeave}>
                        {countEl}
                        {openEl}
                        {collapseEl}
                        {closeEl}
                    </span>
                ),
                overflow: true,
            };
        }

        const joinedChildren = join(value.children.map(rec), baseSymbol(", ", "symbol"));
        return {
            length:
                countLength +
                openLength +
                joinedChildren.reduce((a, {length: b}) => a + b, 0) +
                closeLength,
            el: (
                <span
                    className="value"
                    id={value.id + ""}
                    onMouseEnter={handlers?.onEnter}
                    onMouseLeave={handlers?.onLeave}>
                    {countEl}
                    {openEl}
                    {joinedChildren.map(({el: el}, i) => (
                        <Fragment key={i}>{el}</Fragment>
                    ))}
                    {closeEl}
                </span>
            ),
            overflow: joinedChildren.some(({overflow}) => overflow),
        };
    } else if (value.type == "string") {
        if (remainingDepth == 0) return collapse();
        const parts = value.value.map(part =>
            typeof part == "string"
                ? baseSymbol(part, "raw")
                : baseSymbol(part.text, part.type)
        );
        return {
            length: parts.reduce((a, {length: b}) => a + b, 2), // 2 to account for the quotes
            el: (
                <span
                    className="string value"
                    id={value.id + ""}
                    onMouseEnter={handlers?.onEnter}
                    onMouseLeave={handlers?.onLeave}>
                    "
                    {parts.map(({el}, i) => (
                        <Fragment key={i}>{el}</Fragment>
                    ))}
                    "
                </span>
            ),
            overflow: false,
        };
    } else if (value.type == "location") {
        if (remainingDepth == 0) return collapse();
        return baseSymbol(
            `|${value.uri}|${
                value.position
                    ? `(${value.position.offset.start},${value.position.offset.end},<${value.position.start.line},${value.position.start.column}>,<${value.position.end.line},${value.position.end.column}>)`
                    : ""
            }`,
            "location value",
            value.id
        );
    } else {
        const val = baseSymbol(value.value + "", "value " + value.type, value.id);
        if (remainingDepth == 0) {
            const c = collapse();
            if (val.length < c.length) return val;
            return c;
        }

        return val;
    }
}
