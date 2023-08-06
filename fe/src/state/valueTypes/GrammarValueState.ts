import {DataCacher, Field, IDataHook, Observer} from "model-react";
import {BaseValueTypeState} from "./BaseValueTypeState";
import {IValNode} from "../../_types/IValNode";
import {nonNullFilter} from "../../utils/nonNullFilter";
import {ValuePanelState} from "../ValuePanelState";
import {IGrammarValueSerialization} from "./_types/IGrammarValueSerialization";
import {
    ICharRange,
    IGrammarAttr,
    IGrammarCondition,
    IGrammarData,
    IGrammarProduction,
    IGrammarSymbol,
} from "./_types/IGrammarData";
import {IEntry, IVal} from "../../_types/IVal";
import {TGetType} from "../../value/_types/TGetType";

/**
 * The data to represent graph values
 */
export class GrammarValueState extends BaseValueTypeState {
    public type = "grammar";
    public description = {name: "Grammar", icon: "ChromeBackMirrored"};

    public grammar = new DataCacher(h => {
        const applicable = this.isApplicable(h);
        if (!applicable) return null;

        const nodes = this.panel.getValueNodes(h);
        const map: Record<string | number, IValNode> = {};
        for (let node of nodes) map[node.id] = node;
        return getGrammarData(nodes[1], map);
    });

    /** The nodes that are expanded */
    protected expanded = new Field<Set<string | number>>(new Set());

    /**
     * Updates the nodes that are currently expanded
     * @param expanded The nodes that are now expanded
     */
    public setExpanded(expanded: Set<string | number>) {
        this.expanded.set(expanded);
    }

    /**
     * Retrieves the ids of all nodes that are currently expanded
     * @param hook The hook to subscrive to changes
     * @returns ALl currently expanded nodes
     */
    public getExpanded(hook?: IDataHook): Set<string | number> {
        return this.expanded.get(hook);
    }

    /**
     * Expands all symbols in the grammar
     */
    public expandAll(): void {
        const symbols = new Set<number | string>();

        function rec(
            item: IGrammarProduction | IGrammarSymbol | IGrammarCondition
        ): void {
            if (item.type == "alt" || item.type == "seq") {
                symbols.add(item.source.id);
            }
            if (item.type == "alt" || item.type == "seq") item.expr.forEach(rec);
            else if (
                item.type == "opt" ||
                item.type == "iter" ||
                item.type == "iter-star" ||
                item.type == "label" ||
                item.type == "annotate" ||
                item.type == "follow" ||
                item.type == "not-follow" ||
                item.type == "precede" ||
                item.type == "not-precede" ||
                item.type == "delete"
            )
                rec(item.expr);
            else if (item.type == "iter-seps" || item.type == "iter-star-seps") {
                rec(item.expr);
                item.separators.forEach(rec);
            } else if (item.type == "conditional") {
                rec(item.expr);
                item.conditions.forEach(rec);
            } else if (item.type == "prod") item.symbols.forEach(rec);
            else if (
                item.type == "priority" ||
                item.type == "choice" ||
                item.type == "associativity"
            )
                item.alternatives.forEach(rec);
        }
        this.grammar.get()?.rules.forEach(({value: prod}) => rec(prod));

        this.setExpanded(symbols);
    }

    /**
     * Retrieves all the ancestors of a given node
     * @param node The node to get the ancestors of
     * @returns The ancestors including the passed node
     */
    public getAncestors(node: IValNode): IValNode[] {
        let out: IValNode[] = [];
        const map = this.panel.valueMap.get();
        let n: IValNode | undefined = node;
        while (n) {
            out.push(n);
            n = n.parent && map.has(n.parent) ? map.get(n.parent) : undefined;
        }
        return out;
    }

    /**
     * Retrieves all the descendents of a given node
     * @param node The node to get the descendents of
     * @param out The accumalation array
     * @returns All the descendents including the passed node
     */
    public getDescendents(node: IValNode, out: IValNode[] = []): IValNode[] {
        const map = this.panel.valueMap.get();
        out.push(node);
        for (let childId of node.children) {
            const child = map.has(childId) ? map.get(childId) : undefined;
            if (child) this.getDescendents(child, out);
        }
        return out;
    }

    /** @override */
    public isApplicable(hook?: IDataHook): boolean {
        const value = this.panel.value.get(hook);
        return (
            value != null &&
            !("key" in value) &&
            value.type == "constr" &&
            value.name == "grammar" &&
            value.children[0]?.type == "set" &&
            value.children[1]?.type == "map"
        );
    }

    /** @override */
    public serialize(): IGrammarValueSerialization {
        return {
            type: "grammar",
            expanded: [...this.expanded.get()],
        };
    }

    /** @override */
    public deserialize(value: IGrammarValueSerialization): void {
        this.expanded.set(new Set(value.expanded));
    }
}

type INodeMap = Record<string | number, IValNode>;

/**
 * Extracts the grammar data from a grammar value input
 * @param input The input to extract the data from
 * @param sourceNodes The input nodes that to link with
 * @returns The simpler and validated structured grammar data
 */
export function getGrammarData(input: IValNode, sourceNodes: INodeMap): IGrammarData {
    const val = input.value;
    if ("key" in val || val.type != "constr") return {start: [], rules: []};

    const startVal = checkType(val.children[0], "set");
    let start: IGrammarSymbol[] = [];
    if (startVal)
        start =
            getChildren(getValueNode(startVal, input, sourceNodes), sourceNodes)?.map(
                node => getGrammarSymbol(node, sourceNodes)
            ) ?? [];

    const rulesVal = checkType(val.children[1], "map");
    let rules: {key: IGrammarSymbol; value: IGrammarProduction; source: IValNode}[] = [];
    if (rulesVal)
        rules =
            getChildren(getValueNode(rulesVal, input, sourceNodes), sourceNodes)
                ?.map(node => {
                    const key = sourceNodes[node.children[0]];
                    const value = sourceNodes[node.children[1]];
                    if (!key || !value) return null;
                    return {
                        key: getGrammarSymbol(key, sourceNodes),
                        value: getGrammarProduction(value, sourceNodes),
                        source: node,
                    };
                })
                .filter(nonNullFilter) ?? [];

    return {start, rules};
}

/**
 * Retrieves the grammar symbol corresponding to a given node
 * @param node The node to get the symbol for
 * @param nodes The map of all available nodes
 * @returns The grammar symbol
 */
export function getGrammarSymbol(node: IValNode, nodes: INodeMap): IGrammarSymbol {
    const rec = (node: IValNode) => getGrammarSymbol(node, nodes);
    const val = node.value;
    const source = node;
    const uk = {type: "unknown", source} as const;

    const recList = (
        val: IVal | IEntry | undefined,
        type: "list" | "set" | "tuple",
        parent: IValNode = node
    ): IGrammarSymbol[] => {
        const childrenVal = checkType(val, type);
        if (childrenVal)
            return (
                getChildren(getValueNode(childrenVal, parent, nodes), nodes)?.map(rec) ??
                []
            );
        return [];
    };

    if ("key" in val || val.type != "constr") return uk;
    const nameWoSlash = woSlash(val.name);
    if (
        nameWoSlash == "start" ||
        nameWoSlash == "opt" ||
        nameWoSlash == "iter" ||
        nameWoSlash == "iter-star"
    ) {
        const child = nodes[node.children[0]];
        if (child == undefined) return uk;
        return {type: nameWoSlash, expr: rec(child), source};
    } else if (
        nameWoSlash == "sort" ||
        nameWoSlash == "lex" ||
        nameWoSlash == "layouts" ||
        nameWoSlash == "keywords"
    ) {
        const name = checkType(val.children[0], "string")?.value ?? [""];
        return {type: nameWoSlash, name, source};
    } else if (nameWoSlash == "label") {
        const child = nodes[node.children[1]];
        if (child == undefined) return uk;

        const name = checkType(val.children[0], "string")?.value ?? [""];
        return {type: nameWoSlash, expr: rec(child), name, source};
    } else if (
        nameWoSlash == "parameterized-sort" ||
        nameWoSlash == "parameterized-lex"
    ) {
        const name = checkType(val.children[0], "string")?.value ?? [""];
        const parameters = recList(val.children[1], "list");
        return {type: nameWoSlash, name, source, parameters};
    } else if (nameWoSlash == "lit" || nameWoSlash == "cilit") {
        const text = checkType(val.children[0], "string")?.value ?? [""];
        return {type: nameWoSlash, text, source};
    } else if (nameWoSlash == "char-class") {
        const rangesVal = checkType(val.children[0], "list");
        let ranges: ICharRange[] = [];
        if (rangesVal)
            ranges =
                getChildren(getValueNode(rangesVal, node, nodes), nodes)
                    ?.map(rangeNode => {
                        const constr = checkType(rangeNode.value, "constr");
                        if (!constr) return null;
                        const begin = Math.round(
                            Number(checkType(constr.children[0], "number")?.value)
                        );
                        const end = Math.round(
                            Number(checkType(constr.children[1], "number")?.value)
                        );
                        if (isNaN(begin) || isNaN(end)) return null;
                        return {begin, end, source: rangeNode};
                    })
                    .filter(nonNullFilter) ?? [];
        return {type: "char-class", ranges, source};
    } else if (nameWoSlash == "empty") {
        return {type: "empty", source};
    } else if (nameWoSlash == "iter-seps" || nameWoSlash == "iter-star-seps") {
        const child = nodes[node.children[0]];
        if (child == undefined) return uk;
        const separators = recList(val.children[1], "list");
        return {type: nameWoSlash, expr: rec(child), separators, source};
    } else if (nameWoSlash == "alt") {
        const alternatives = recList(val.children[0], "set");
        return {type: nameWoSlash, expr: alternatives, source};
    } else if (nameWoSlash == "seq") {
        const alternatives = recList(val.children[0], "list");
        return {type: nameWoSlash, expr: alternatives, source};
    } else if (nameWoSlash == "annotate") {
        const child = nodes[node.children[0]];
        if (child == undefined) return uk;
        const annotations = checkType(val.children[1], "set");
        if (annotations == undefined) return uk;
        const textAnnotations = annotations.children
            .map(v => checkType(v, "string")?.value ?? null)
            .filter(nonNullFilter);
        return {
            type: nameWoSlash,
            expr: rec(child),
            annotations,
            textAnnotations,
            source,
        };
    } else if (nameWoSlash == "custom") {
        const child = nodes[node.children[1]];
        if (child == undefined) return uk;

        const typeName = checkType(val.children[0], "string")?.value ?? [""];
        return {type: nameWoSlash, expr: rec(child), typeName, source};
    } else if (nameWoSlash == "conditional") {
        const child = nodes[node.children[0]];
        if (child == undefined) return uk;

        const conditionsVal = checkType(val.children[1], "set");
        let conditions: IGrammarCondition[] = [];
        if (conditionsVal)
            conditions =
                getChildren(getValueNode(conditionsVal, node, nodes), nodes)
                    ?.map<IGrammarCondition | null>(source => {
                        const constr = checkType(source.value, "constr");
                        if (!constr) return null;
                        const nameWOSlash = woSlash(constr.name);
                        if (
                            nameWOSlash == "follow" ||
                            nameWOSlash == "not-follow" ||
                            nameWOSlash == "precede" ||
                            nameWOSlash == "not-precede" ||
                            nameWOSlash == "delete"
                        ) {
                            const child = nodes[source.children[0]];
                            if (child == undefined) return null;
                            return {type: nameWOSlash, expr: rec(child), source};
                        } else if (nameWOSlash == "at-column") {
                            const val = Math.round(
                                Number(checkType(constr.children[0], "number"))
                            );
                            if (isNaN(val)) return null;
                            return {type: "at-column", column: val, source};
                        } else if (
                            nameWOSlash == "begin-of-line" ||
                            nameWOSlash == "end-of-line"
                        ) {
                            return {type: nameWOSlash, source};
                        } else if (nameWOSlash == "except") {
                            const label = checkType(
                                constr.children[0],
                                "string"
                            )?.valuePlain;
                            if (!label) return null;
                            return {type: "except", except: label, source};
                        }
                        return null;
                    })
                    .filter(nonNullFilter) ?? [];

        return {type: nameWoSlash, conditions, expr: rec(child), source};
    }

    return uk;
}

function checkType<K extends IVal["type"]>(
    val: IVal | IEntry | undefined,
    type: K
): null | TGetType<K> {
    if (!val) return null;
    if ("key" in val) return null;
    if (val.type != type) return null;
    return val as any;
}

function getChildren(node: IValNode | null, nodes: INodeMap): IValNode[] | null {
    if (!node) return null;
    return node.children.map(childId => nodes[childId]);
}
function getValueNode(val: IVal, node: IValNode, nodes: INodeMap): IValNode | null {
    return getChildren(node, nodes)?.find(child => child?.value == val) ?? null;
}

/**
 * Retrieves the grammar production corresponding to a given node
 * @param node The node to get the symbol for
 * @param nodes The map of all available nodes
 * @returns The grammar production
 */
export function getGrammarProduction(
    node: IValNode,
    nodes: INodeMap
): IGrammarProduction {
    const rec = (node: IValNode) => getGrammarProduction(node, nodes);
    const val = node.value;
    const source = node;
    const uk = {type: "unknown", source} as const;

    const recList = (
        val: IVal | IEntry | undefined,
        type: "list" | "set" | "tuple",
        parent: IValNode = node
    ): IGrammarProduction[] => {
        const childrenVal = checkType(val, type);
        if (childrenVal)
            return (
                getChildren(getValueNode(childrenVal, parent, nodes), nodes)?.map(rec) ??
                []
            );
        return [];
    };

    if ("key" in val || val.type != "constr") return uk;
    const nameWoSlash = woSlash(val.name);

    const firstChild = nodes[node.children[0]];
    if (!firstChild) return uk;
    const definition = getGrammarSymbol(firstChild, nodes);

    if (nameWoSlash == "prod") {
        const symbolsVal = checkType(val.children[1], "list");
        let symbols: IGrammarSymbol[] = [];
        if (symbolsVal)
            symbols =
                getChildren(getValueNode(symbolsVal, node, nodes), nodes)?.map(n =>
                    getGrammarSymbol(n, nodes)
                ) ?? [];

        const attributesVal = checkType(val.children[2], "set");
        let attributes: IGrammarAttr[] = [];
        if (attributesVal)
            attributes =
                getChildren(
                    getValueNode(attributesVal, node, nodes),
                    nodes
                )?.map<IGrammarAttr>(source => {
                    const constr = checkType(source.value, "constr");
                    const uk = {type: "unknown" as const, source};
                    if (!constr) return uk;
                    if (constr.name == "tag") {
                        if (constr.children.length == 0) return uk;
                        return {type: "tag", value: constr.children[0], source};
                    } else if (constr.name == "bracket") return {type: "bracket", source};
                    else if (constr.name == "assoc") {
                        const type = woSlash(
                            checkType(constr.children[0], "constr")?.name ?? ""
                        );
                        if (
                            !(
                                type == "left" ||
                                type == "right" ||
                                type == "assoc" ||
                                type == "non-assoc"
                            )
                        )
                            return uk;
                        return {type: "assoc", associativity: type, source};
                    }
                    return uk;
                }) ?? [];

        return {
            type: "prod",
            definition,
            attributes,
            source,
            symbols,
        };
    } else if (nameWoSlash == "regular") {
        return {
            type: "regular",
            definition,
            source,
        };
    } else if (nameWoSlash == "priority") {
        const alternatives = recList(val.children[1], "list");
        return {
            type: "priority",
            definition,
            alternatives,
            source,
        };
    } else if (nameWoSlash == "associativity") {
        const type = woSlash(checkType(val.children[1], "constr")?.name ?? "");
        if (
            !(type == "left" || type == "right" || type == "assoc" || type == "non-assoc")
        )
            return uk;

        const alternatives = recList(val.children[2], "set");
        return {
            type: "associativity",
            definition,
            associativity: type,
            alternatives,
            source,
        };
    } else if (nameWoSlash == "choice") {
        const alternatives = recList(val.children[1], "set");
        return {
            type: "choice",
            definition,
            alternatives,
            source,
        };
    } else if (nameWoSlash == "reference") {
        const reference = checkType(val.children[1], "string")?.valuePlain;
        if (!reference) return uk;
        return {
            type: "reference",
            definition,
            reference,
            source,
        };
    }
    return uk;
}

const woSlash = <T extends string>(type: string): T extends `\\${infer U}` ? U : T =>
    type[0] == "\\" ? type.substring(1) : (type as any);
