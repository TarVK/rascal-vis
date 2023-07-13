import React, {Fragment} from "react";
import {IGrammarProduction} from "../../../state/valueTypes/_types/IGrammarData";
import {IGrammarInteractionHandler} from "./_types/IGrammarInteractionHandler";
import {highlightSymbol} from "./highlightSymbol";
import {ISettings} from "../../../state/_types/ISettings";

/**
 * Highlights the given grammar production rule
 * @param production The production rule to highlight and add handlers to
 * @param handlers The handlers to be added
 * @returns The resulting element
 */
export function highlightProduction(
    production: IGrammarProduction,
    settings: ISettings["grammar"],
    handlers: IGrammarInteractionHandler
): JSX.Element {
    const attrs = {
        ...handlers(production.source, production),
        id: production.source.value.id + "",
        "node-id": production.source.id,
    };
    const rec = (symbol: IGrammarProduction) =>
        highlightProduction(symbol, settings, handlers);
    const indent = 20;
    const choice = (type: string) => (prod: IGrammarProduction, index: number) =>
        (
            <div style={{display: "flex", gap: 5}} key={index}>
                <span
                    style={{
                        flexShrink: 0,
                        display: "inline-block",
                        width: 15,
                        textAlign: "right",
                        // Prevent extra indent between choice and priority groups
                        marginRight:
                            prod.type == "choice" || prod.type == "priority" ? -20 : 0,
                    }}>
                    {index == 0 ? "" : <span className={`glyph ${type}`}>{type}</span>}
                </span>
                {rec(prod)}
            </div>
        );
    if (production.type == "choice") {
        const alts = production.alternatives;
        // if (alts.length == 0)
        //     return <div className="production choice empty" {...attrs}></div>;
        // if (alts.length == 1) return rec(alts[0]);

        return (
            <div className="production choice" {...attrs}>
                {alts.map(choice("|"))}
            </div>
        );
    } else if (production.type == "associativity") {
        const alts =
            production.alternatives.length == 1
                ? [<Fragment key="0">{rec(production.alternatives[0])}</Fragment>]
                : production.alternatives.map(choice("|"));
        return (
            <div
                className="production associativity"
                {...attrs}
                style={{display: "flex", gap: 5}}>
                <div className="keyword">{production.associativity}</div>{" "}
                {alts.length == 1 ? (
                    alts
                ) : (
                    <div style={{flexGrow: 1}}>
                        <div style={{display: "flex"}}>
                            <span
                                className="glyph"
                                style={{flexShrink: 0, width: 15, marginRight: -20}}>
                                (
                            </span>
                            <div>{alts}</div>
                        </div>
                        <span className="glyph">)</span>
                    </div>
                )}
            </div>
        );
    } else if (production.type == "priority") {
        return (
            <div className="production priority" {...attrs}>
                {production.alternatives.map(choice(">"))}
            </div>
        );
    } else if (production.type == "regular") {
        // TODO: see how to handle this case
        return (
            <div className="production regular" {...attrs}>
                Regular
            </div>
        );
    } else if (production.type == "reference") {
        return (
            <div className="production reference" {...attrs}>
                {production.reference}
            </div>
        );
    } else if (production.type == "prod") {
        let label = undefined;
        if (production.definition.type == "label") label = production.definition.name;
        return (
            <div className="production prod" {...attrs}>
                {label && <span className={"prodLabel"}>{label + ": "}</span>}
                {production.symbols.map((symbol, i) => (
                    <Fragment key={i}>
                        {highlightSymbol(symbol, settings, handlers)}{" "}
                    </Fragment>
                ))}
            </div>
        );
    }
    return <></>;
}
