import React, {Fragment} from "react";
import {ICharRange, IGrammarSymbol} from "../../../state/valueTypes/_types/IGrammarData";
import {IGrammarInteractionHandler} from "./_types/IGrammarInteractionHandler";
import {intersperse} from "../../../utils/intersperse";
import {IEscapedString} from "../../../_types/IEscapeString";
import {ISettings} from "../../../state/_types/ISettings";

/**
 * Highlights the given grammar symbol
 * @param symbol The symbol to highlight and add handlers to
 * @param handlers THe handlers to add
 * @returns The jsc element representing the symbol
 */
export function highlightSymbol(
    symbol: IGrammarSymbol,
    settings: ISettings["grammar"],
    handlers: IGrammarInteractionHandler
): JSX.Element {
    const attrs = {
        ...handlers(symbol.source, symbol),
        id: symbol.source.value.id + "",
        "node-id": symbol.source.id,
    };

    const getText = (text: IEscapedString) =>
        text.map((text, i) =>
            typeof text == "string" ? (
                <Fragment key={i}>{text}</Fragment>
            ) : (
                <span key={i} className="escaped">
                    \{text.text}
                </span>
            )
        );
    const rec = (symbol: IGrammarSymbol) => highlightSymbol(symbol, settings, handlers);
    if (symbol.type == "start") {
        return (
            <span className="symbol start" {...attrs}>
                start<span className="glyph">(</span>
                {rec(symbol.expr)}
                <span className="glyph">)</span>
            </span>
        );
    } else if (
        symbol.type == "sort" ||
        symbol.type == "lex" ||
        symbol.type == "layouts" ||
        symbol.type == "keywords"
    ) {
        if (symbol.type == "layouts" && !settings.showLayout) return <></>;
        return (
            <span className={`symbol ${symbol.type}`} {...attrs}>
                {getText(symbol.name)}
            </span>
        );
    } else if (
        symbol.type == "unknown" ||
        symbol.type == "parameterized-lex" ||
        symbol.type == "parameterized-sort"
    ) {
        console.log(symbol);
        // TODO: implement parameterized types properly
        return (
            <span className="symbol unknown glyph" {...attrs}>
                ???
            </span>
        );
    } else if (symbol.type == "empty") {
        return (
            <span className="symbol empty glyph" {...attrs}>
                ()
            </span>
        );
    } else if (symbol.type == "alt") {
        return (
            <span className="symbol alts" {...attrs}>
                <span className="glyph">(</span>
                {/* <div style={{paddingLeft: 20}}>
                    {symbol.expr.map(rec).map((el, i) => (
                        <Fragment key={i}>
                            <span
                                style={{
                                    display: "inline-block",
                                    textAlign: "right",
                                    width: 20,
                                }}>
                                {i != 0 ? "|" : ""}
                            </span>
                            {el}
                            <br />
                        </Fragment>
                    ))}
                </div> */}
                {symbol.expr.map(rec).map((el, i) => (
                    <Fragment key={i}>
                        {i != 0 ? <span className="glyph">|</span> : ""}
                        {el}
                    </Fragment>
                ))}
                <span className="glyph">)</span>
            </span>
        );
    } else if (symbol.type == "label") {
        if (!settings.showLayout && symbol.expr.type == "layouts") return <></>;
        return (
            <span className="symbol symLabel" {...attrs}>
                {rec(symbol.expr)}{" "}
                <span className="symLabelName identifier">{getText(symbol.name)}</span>
            </span>
        );
    } else if (symbol.type == "lit") {
        return (
            <span className="symbol lit" {...attrs}>
                "{getText(symbol.text)}"
            </span>
        );
    } else if (symbol.type == "cilit") {
        return (
            <span className="symbol cilit" {...attrs}>
                '{getText(symbol.text)}'
            </span>
        );
    } else if (symbol.type == "char-class") {
        let ranges = symbol.ranges;
        const invert =
            ranges[0]?.begin == 1 && ranges[ranges.length - 1]?.end == rangeEnd;
        if (invert) ranges = invertClass(ranges);

        const rangeChars = ranges.map((range, i) => {
            const {begin, end, source} = range;
            const attrs = {
                ...handlers(source, range),
                id: source.value.id + "",
                "node-id": source.id,
            };
            if (begin == end)
                return (
                    <span key={i} className="charRange" {...attrs}>
                        {makeCharClassCharEl(begin)}
                    </span>
                );
            return (
                <span key={i} className="charRange" {...attrs}>
                    {makeCharClassCharEl(begin)}
                    <span className="glyph">-</span>
                    {makeCharClassCharEl(end)}
                </span>
            );
        });
        return (
            <span className="symbol charClass" {...attrs}>
                {invert && <span className="glyph invert">!</span>}
                <span className="glyph">[</span>
                {rangeChars}
                <span className="glyph">]</span>
            </span>
        );
    } else if (symbol.type == "seq") {
        return (
            <span className="symbol seq" {...attrs}>
                <span className="glyph">(</span>
                {symbol.expr.map((c, i) => (
                    <Fragment key={i}>{rec(c)}</Fragment>
                ))}
                <span className="glyph">)</span>
            </span>
        );
    } else if (symbol.type == "opt") {
        return (
            <span className="symbol opt" {...attrs}>
                {rec(symbol.expr)}
                <span className="glyph">?</span>
            </span>
        );
    } else if (
        symbol.type == "iter" ||
        symbol.type == "iter-star" ||
        symbol.type == "iter-seps" ||
        symbol.type == "iter-star-seps"
    ) {
        if (symbol.type == "iter-seps" || symbol.type == "iter-star-seps") {
            // If we hide layout, we might not have any separators left
            let hasSeparators = true;
            if (!settings.showLayout)
                hasSeparators = symbol.separators.some(t => t.type != "layouts");

            if (hasSeparators)
                return (
                    <span className={`symbol ${symbol.type}`} {...attrs}>
                        <span className="glyph">{"{"}</span>
                        {rec(symbol.expr)}{" "}
                        {symbol.separators.map((c, i) => (
                            <Fragment key={i}>{rec(c)}</Fragment>
                        ))}
                        <span className="glyph">
                            {"}"}
                            {symbol.type == "iter-star-seps" ? "*" : "+"}
                        </span>
                    </span>
                );
        }

        return (
            <span className={`symbol ${symbol.type}`} {...attrs}>
                {rec(symbol.expr)}
                <span className="glyph">
                    {symbol.type == "iter-star" || symbol.type == "iter-star-seps"
                        ? "*"
                        : "+"}
                </span>
            </span>
        );
    } else if (symbol.type == "conditional") {
        let el = rec(symbol.expr);
        for (let con of symbol.conditions) {
            const attrs = {
                ...handlers(con.source, con),
                id: con.source.value.id + "",
                "node-id": con.source.id,
            };
            if (con.type == "at-column")
                el = (
                    <span className="symbol conditional atColumn" {...attrs}>
                        {el}
                        <span className="glyph">@</span>
                        <span className="number">{con.column}</span>
                    </span>
                );
            else if (con.type == "begin-of-line")
                el = (
                    <span className="symbol conditional beginOfLine" {...attrs}>
                        <span className="glyph">^</span>
                        {el}
                    </span>
                );
            else if (con.type == "end-of-line")
                el = (
                    <span className="symbol conditional endOfLine" {...attrs}>
                        {el}
                        <span className="glyph">_</span>
                    </span>
                );
            else if (con.type == "follow")
                el = (
                    <span className="symbol conditional follow" {...attrs}>
                        {el}
                        <span className="glyph">{" >> "}</span>
                        {rec(con.expr)}
                    </span>
                );
            else if (con.type == "not-follow")
                el = (
                    <span className="symbol conditional notFollow" {...attrs}>
                        {el}
                        <span className="glyph">{" !>> "}</span>
                        {rec(con.expr)}
                    </span>
                );
            else if (con.type == "precede")
                el = (
                    <span className="symbol conditional precede" {...attrs}>
                        {rec(con.expr)}
                        <span className="glyph">{" << "}</span>
                        {el}
                    </span>
                );
            else if (con.type == "not-precede")
                el = (
                    <span className="symbol conditional notPrecede" {...attrs}>
                        {rec(con.expr)}
                        <span className="glyph">{" !<< "}</span>
                        {el}
                    </span>
                );
            else if (con.type == "delete")
                el = (
                    <span className="symbol conditional delete" {...attrs}>
                        {el}
                        <span className="glyph"> \ </span>
                        {rec(con.expr)}
                    </span>
                );
            else if (con.type == "except")
                el = (
                    <span className="symbol conditional except" {...attrs}>
                        {el}
                        <span className="glyph">!</span>
                        <span className="identifier">{con.except}</span>
                    </span>
                );
            else if (con.type == "unknown")
                el = (
                    <span className="symbol conditional unknown" {...attrs}>
                        {el} <span className="glyph">???</span>
                    </span>
                );
        }
        return el;
    }

    return (
        <span className="symbol unknown" {...attrs}>
            ???
        </span>
    );
}

/**
 * Retrieves the string character element for a given numeric char, according to rascal's implementation
 * @param ch The character code
 * @returns The element
 */
function makeCharClassCharEl(ch: number) {
    const char = makeCharClassChar(ch);
    if (typeof char == "string") return char;
    else {
        const prefix =
            char.type == "escaped"
                ? "\\"
                : char.type == "u"
                ? "\\u"
                : char.type == "U"
                ? "\\U"
                : "\\a";
        return (
            <span className={`string ${char.type}`}>
                {prefix}
                {char.text}
            </span>
        );
    }
}

/**
 * Retrieves the string character for a given numeric char, according to rascal's implementation
 * @param ch The value to get the string representation for
 * @returns The string representation
 */
function makeCharClassChar(
    ch: number
): string | {type: "escaped" | "u" | "U" | "a"; text: string} {
    // if (ch == 32) return "\\ ";
    // if (ch == 45) return "\\-";
    // if (ch == 91) return "\\[";
    // if (ch == 93) return "\\]";
    // if (ch == 95) return "_";

    if (ch < 128) {
        const char = String.fromCharCode(ch);
        const escape = {
            " ": " ",
            "-": "-",
            "[": "[",
            "]": "]",
            "<": "<",
            ">": ">",
            '"': '"',
            "\n": "n",
            "\b": "b",
            "\t": "t",
            "\r": "r",
            "\\": "\\",
        };
        if (char in escape)
            return {type: "escaped", text: escape[char as keyof typeof escape]};
        if (ch <= 31 || ch == 127)
            return {type: "a", text: ch.toString(16).padStart(2, "0")};
        return char;
    } else if (ch >= 128 && ch <= 0xfff) {
        // prettier-ignore
        const d1 = ch % 8,  r1 = Math.floor(ch / 8),
              d2 = r1 % 8,  r2 = Math.floor(r1 / 8),
              d3 = r2 % 8, r3 = Math.floor(r2 / 8), 
              d4 = r3;
        return {type: "u", text: `${d4}${d3}${d2}${d1}`};
    }

    // prettier-ignore
    const d1 = ch % 16, r1 = Math.floor(ch / 16),
        d2 = r1 % 16, r2 = Math.floor(r1 / 16),
        d3 = r2 % 16, r3 = Math.floor(r2 / 16),
        d4 = r3 % 16, r4 = Math.floor(r3 / 16),
        d5 = r4 % 16, r5 = Math.floor(r4 / 16),
        d6 = r5;
    const hex = "0123456789ABCDEF".split("");
    return {
        type: "U",
        text: `${hex[d6]}${hex[d5]}${hex[d4]}${hex[d3]}${hex[d2]}${hex[d1]}`,
    };
}

const rangeEnd = 0x10ffff;
function invertClass(chars: ICharRange[]): ICharRange[] {
    let prevStart = 1;
    const out: ICharRange[] = [];
    for (const range of chars) {
        const end = range.begin - 1;
        if (end >= prevStart) out.push({begin: prevStart, end, source: range.source});
        prevStart = range.end + 1;
    }

    if (rangeEnd >= prevStart)
        out.push({
            begin: prevStart,
            end: rangeEnd,
            // Fake source if we don't have any
            source: chars[chars.length - 1]?.source ?? {
                id: "",
                children: [],
                name: "",
                parent: "",
                range: 0,
                value: {type: "boolean", value: false, id: 0},
            },
        });

    return out;
}
