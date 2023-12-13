import P, {Parser, Reply} from "parsimmon";
import {IRegex, IValPlain, IValPlainPattern} from "../_types/IVal";

const WS = P.regex(/\s*/);
export const value: Parser<IValPlain> = P.lazy(() =>
    P.alt<IValPlain>(
        constr(value),
        node(value),
        map,
        set(value),
        list(value),
        tuple(value),
        string,
        number,
        boolean,
        loc
    )
);

export const valuePattern: Parser<IValPlainPattern> = P.lazy(() =>
    P.sepBy1(
        P.alt<IValPlainPattern>(
            constrPattern(valuePattern),
            map,
            set(valuePattern),
            list(valuePattern),
            tuple(valuePattern),
            string,
            number,
            boolean,
            loc,
            anyPattern,
            repeatPattern(valuePattern),
            textPattern,
            regexPattern
        ),
        P.string("||")
    ).map(options => ({type: "or", options} as const))
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

const valueList = <T>(value: Parser<T>) => P.sepBy(value, P.seq(WS, P.string(","), WS));
const namedValueList = <T, U = string>(
    value: Parser<T>,
    name: Parser<U> = identifier as any
) =>
    P.sepBy(
        P.seq(name, WS, P.string("="), WS, value).map(([name, _1, _2, _3, value]) => ({
            name,
            value,
        })),
        P.seq(WS, P.string(","), WS)
    );

const set = <T>(value: Parser<T>) =>
    P.seq(P.string("{"), WS, valueList(value), WS, P.string("}")).map(
        ([_1, _2, values, _3, _4]) => ({type: "set" as const, children: values})
    );
const tuple = <T>(value: Parser<T>) =>
    P.seq(P.string("<"), WS, valueList(value), WS, P.string(">")).map(
        ([_1, _2, values, _3, _4]) => ({type: "tuple" as const, children: values})
    );
const list = <T>(value: Parser<T>) =>
    P.seq(P.string("["), WS, valueList(value), WS, P.string("]")).map(
        ([_1, _2, values, _3, _4]) => ({type: "list" as const, children: values})
    );

const constr = <T>(value: Parser<T>) =>
    P.seq(
        identifier,
        WS,
        P.string("("),
        WS,
        valueList(value),
        P.seq(WS, P.string(",").or(P.of(null)), WS),
        namedValueList(value),
        WS,
        P.string(")")
    ).map(([name, _1, _2, _3, values, _4, namedValues, _5, _6]) => ({
        type: "constr" as const,
        name,
        children: values,
        namedChildren: namedValues,
    }));
const node = <T>(value: Parser<T>) =>
    P.seq(
        P.regex(/"[^"]*"/).desc("string"),
        WS,
        P.string("("),
        WS,
        valueList(value),
        P.seq(WS, P.string(",").or(P.of(null)), WS),
        namedValueList(value),
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
        .or(
            P.regex(/\\./).map(text => ({
                type: "escaped" as const,
                text: text.substring(1),
            }))
        )
        .many(),
    P.string('"')
).map(([_1, text, _2]) => ({
    type: "string" as const,
    value: text,
    valuePlain: text.map(v => (typeof v == "string" ? v : "\\" + v.text)).join(""),
}));
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
    ).or(P.succeed(undefined))
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

const constrPattern = <T>(value: Parser<T>) =>
    P.seq(
        identifier.or(regexPattern).or(textPattern),
        WS,
        P.string("("),
        WS,
        valueList(value),
        P.seq(WS, P.string(",").or(P.of(null)), WS),
        namedValueList(value, identifier.or(regexPattern).or(textPattern)),
        WS,
        P.string(")")
    ).map(([name, _1, _2, _3, values, _4, namedValues, _5, _6]) => ({
        type: "constr" as const,
        name,
        children: values,
        namedChildren: namedValues,
    }));

const anyPattern = P.string(".")
    .or(P.string("_"))
    .map(() => ({type: "any"} as const));
const repeatPattern = <T>(value: Parser<T>) =>
    P.seq(P.string("*"), WS, value).map(
        ([_1, _2, value]) => ({type: "repeat", value} as const)
    );

const regexPattern = P<IRegex>((input, i) => {
    const result: Reply<unknown> = (
        P.seq(P.string("/"), P.regex(/(\\.|[^/])*/), P.string("/")) as any
    )._(input, i);

    if (!result.status) return result;
    try {
        console.log(result);
        const regex = new RegExp((result.value as any)[1]);
        return P.makeSuccess(result.index, {type: "regex", regex});
    } catch (e) {
        return P.makeFailure(i, ["a valid regular expression"]);
    }
});
const textPattern = P.seq(
    P.string("'"),
    P.regex(/((?!\\.)[^"])+/)
        .or(
            P.regex(/\\./).map(text => ({
                type: "escaped" as const,
                text: text.substring(1),
            }))
        )
        .many(),
    P.string("'")
).map(([_1, text, _2]) => ({
    type: "textPattern" as const,
    value: text,
    valuePlain: text.map(v => (typeof v == "string" ? v : "\\" + v.text)).join(""),
}));
