import P, {Parser} from "parsimmon";
import {IValPlain} from "../_types/IVal";

const WS = P.regex(/\s*/);
export const value: Parser<IValPlain> = P.lazy(() =>
    P.alt<IValPlain>(constr, node, map, set, list, tuple, string, number, boolean, loc)
);

const identifier = P.regex(/[\\\-a-zA-Z]+/).desc("identifier");
const map = P.seq(
    P.string("("),
    WS,
    P.sepBy(
        P.seq(value, WS, P.string(":"), WS, value).map(([key, _1, _2, _3, value]) => ({
            key,
            value,
        })),
        P.seq(WS, P.string(","), WS)
    ),
    WS,
    P.string(")")
).map(([_1, _2, entries, _3, _4]) => ({type: "map" as const, children: entries}));

const valueList = P.sepBy(value, P.seq(WS, P.string(","), WS));
const namedValueList = P.sepBy(
    P.seq(identifier, WS, P.string("="), WS, value).map(([name, _1, _2, _3, value]) => ({
        name,
        value,
    })),
    P.seq(WS, P.string(","), WS)
);

const set = P.seq(P.string("{"), WS, valueList, WS, P.string("}")).map(
    ([_1, _2, values, _3, _4]) => ({type: "set" as const, children: values})
);
const tuple = P.seq(P.string("<"), WS, valueList, WS, P.string(">")).map(
    ([_1, _2, values, _3, _4]) => ({type: "tuple" as const, children: values})
);
const list = P.seq(P.string("["), WS, valueList, WS, P.string("]")).map(
    ([_1, _2, values, _3, _4]) => ({type: "list" as const, children: values})
);

const constr = P.seq(
    identifier,
    WS,
    P.string("("),
    WS,
    valueList,
    P.seq(WS, P.string(",").or(P.of(null)), WS),
    namedValueList,
    WS,
    P.string(")")
).map(([name, _1, _2, _3, values, _4, namedValues, _5, _6]) => ({
    type: "constr" as const,
    name,
    children: values,
    namedChildren: namedValues,
}));
const node = P.seq(
    P.regex(/"[^"]*"/).desc("string"),
    WS,
    P.string("("),
    WS,
    valueList,
    P.seq(WS, P.string(",").or(P.of(null)), WS),
    namedValueList,
    WS,
    P.string(")")
).map(([name, _1, _2, _3, values, _4, namedValues, _5, _6]) => ({
    type: "node" as const,
    name: name.substring(1, name.length - 1),
    children: values,
    namedChildren: namedValues,
}));

const string = P.seq(
    P.string('"'),
    P.regex(/((?!\\.)[^"])+/)
        .or(P.regex(/\\./).map(text => ({type: "escaped" as const, text})))
        .many(),
    P.string('"')
).map(([_1, text, _2]) => ({type: "string" as const, value: text}));
const number = P.regex(/\-?[0-9]+(\.[0-9]+(e\-?[0-9]+)?)?/)
    .desc("digit")
    .or(P.fail("'-'"))
    .map(text => ({type: "number" as const, value: text}));
const boolean = P.string("true")
    .or(P.string("false"))
    .map(text => ({
        type: "boolean" as const,
        value: text == "true",
    }));

const int = P.regex(/[0-9]+/)
    .desc("integer")
    .map(val => Number(val));
const comma = P.seq(WS, P.string(","), WS);
const position = P.seq(P.string("<"), int, comma, int, P.string(">")).map(
    ([_1, line, _2, column, _3]) => ({line, column})
);
const loc = P.seq(
    P.string("|"),
    P.regex(/[^\|]*/),
    P.string("|"),
    P.seq(
        P.string("("),
        int,
        comma,
        int,
        comma,
        position,
        comma,
        position,
        P.string(")")
    ).or(P.empty())
).map(([_1, uri, _2, position]) => ({
    type: "location" as const,
    uri,
    position: position
        ? {
              offset: {start: position[1], end: position[3]},
              start: position[5],
              end: position[7],
          }
        : undefined,
}));
