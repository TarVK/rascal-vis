import React, {FC, Fragment, useRef, useLayoutEffect, ReactNode, useState} from "react";
import {IValNode} from "../../_types/IValNode";
import {IEntry, IVal} from "../../_types/IVal";
import {IHighlight} from "./_types/IHighlight";

/**
 * Retrieves the highlighted text fora  given value
 * @param value The value to be highlighted
 * @param remainingDepth The remaining depth to be expanded
 * @returns The highlighted text element and character count
 */
export function highlight(value: IVal | IEntry, remainingDepth: number): IHighlight {
    const rec = (value: IVal | IEntry) => highlight(value, remainingDepth - 1);
    const baseSymbol = (text: string, type: string) => ({
        length: text.length,
        element: <span className={type}>{text}</span>,
    });
    const join = (nodes: IHighlight[], sep: IHighlight): IHighlight[] =>
        nodes.flatMap(node => [sep, node]).slice(1);
    const collapse = () => baseSymbol("...", "collapse");

    if ("key" in value) {
        if (remainingDepth == 0) return collapse();
        const {length: keyLength, element: keyElement} = rec(value.key);
        const {length: sepLength, element: sepElement} = baseSymbol(": ", "symbol");
        const {length: valueLength, element: valueElement} = rec(value.value);
        return {
            length: keyLength + sepLength + valueLength,
            element: (
                <>
                    {keyElement}
                    {sepElement}
                    {valueElement}
                </>
            ),
        };
    } else if (value.type == "constr" || value.type == "node") {
        if (remainingDepth == 0) return collapse();
        const {length: nameLength, element: nameElement} = baseSymbol(
            value.name,
            "identifier"
        );
        const {length: openLength, element: openElement} = baseSymbol("(", "symbol");
        const indexedChildren = value.children.map(rec);
        const namedChildren = value.namedChildren.map(({name, value}) => {
            const {length: nameLength, element: nameElement} = baseSymbol(name, "name");
            const {length: sepLength, element: sepElement} = baseSymbol("=", "symbol");
            const {length: childLength, element: childElement} = rec(value);
            return {
                length: nameLength + sepLength + childLength,
                element: (
                    <>
                        {nameElement}
                        {sepElement}
                        {childElement}
                    </>
                ),
            };
        });
        const joinedChildren = join(
            [...indexedChildren, ...namedChildren],
            baseSymbol(", ", "symbol")
        );
        const {length: closeLength, element: closeElement} = baseSymbol(")", "symbol");
        return {
            length:
                nameLength +
                openLength +
                joinedChildren.reduce((a, {length: b}) => a + b, 0) +
                closeLength,
            element: (
                <>
                    {nameElement}
                    {openElement}
                    {joinedChildren.map(({element}, i) => (
                        <Fragment key={i}>{element}</Fragment>
                    ))}
                    {closeElement}
                </>
            ),
        };
    } else if (value.type == "map") {
        if (remainingDepth == 0) return collapse();
        const {length: openLength, element: openElement} = baseSymbol("(", "symbol");
        const {length: closeLength, element: closeElement} = baseSymbol(")", "symbol");
        if (remainingDepth == 2) {
            // Would result in `(...: ..., ...: ...)`, we prefer `(..., ..., ...)` instead
            remainingDepth = 1;
        }
        const joinedChildren = join(value.children.map(rec), baseSymbol(", ", "symbol"));

        return {
            length:
                openLength +
                joinedChildren.reduce((a, {length: b}) => a + b, 0) +
                closeLength,
            element: (
                <>
                    {openElement}
                    {joinedChildren.map(({element}, i) => (
                        <Fragment key={i}>{element}</Fragment>
                    ))}
                    {closeElement}
                </>
            ),
        };
    } else if (value.type == "list" || value.type == "set" || value.type == "tuple") {
        const brackets =
            value.type == "set"
                ? {o: "{", c: "}"}
                : value.type == "tuple"
                ? {o: "<", c: ">"}
                : {o: "[", c: "]"};
        const {length: countLength, element: countElement} =
            value.type == "set" || value.type == "list"
                ? baseSymbol(`(${value.children.length})`, "count")
                : {length: 0, element: undefined};

        const {length: openLength, element: openElement} = baseSymbol(
            brackets.o,
            "symbol"
        );
        const {length: closeLength, element: closeElement} = baseSymbol(
            brackets.c,
            "symbol"
        );

        if (remainingDepth == 0) {
            const {length: collapseLength, element: collapseElement} = collapse();
            return {
                length: countLength + openLength + collapseLength + closeLength,
                element: (
                    <>
                        {countElement}
                        {openElement}
                        {collapseElement}
                        {closeElement}
                    </>
                ),
            };
        }

        const joinedChildren = join(value.children.map(rec), baseSymbol(", ", "symbol"));
        return {
            length:
                countLength +
                openLength +
                joinedChildren.reduce((a, {length: b}) => a + b, 0) +
                closeLength,
            element: (
                <>
                    {countElement}
                    {openElement}
                    {joinedChildren.map(({element}, i) => (
                        <Fragment key={i}>{element}</Fragment>
                    ))}
                    {closeElement}
                </>
            ),
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
            element: (
                <span className="string">
                    "
                    {parts.map(({element}, i) => (
                        <Fragment key={i}>{element}</Fragment>
                    ))}
                    "
                </span>
            ),
        };
    } else if (value.type == "location") {
        if (remainingDepth == 0) return collapse();
        return baseSymbol(
            `|${value.uri}|${
                value.position
                    ? `(${value.position.offset.start},${value.position.offset.end},<${value.position.start.line},${value.position.start.column}>,<${value.position.end.line},${value.position.end.column}>)`
                    : ""
            }`,
            "location"
        );
    } else {
        if (remainingDepth == 0) return collapse();
        return baseSymbol(value.value + "", value.type);
    }
}
