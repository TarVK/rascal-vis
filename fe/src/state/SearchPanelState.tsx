import React, {FC} from "react";
import {DataCacher, Field, IDataHook} from "model-react";
import {PanelState} from "./PanelState";
import {IValNode} from "../_types/IValNode";
import {valuePattern} from "../parse/parser";
import {intersperseDynamic} from "../utils/intersperse";
import {IEntry, IRegex, ITextPattern, IVal, IValPlainPattern} from "../_types/IVal";
import {matchesPattern} from "../parse/matchesPattern";
import {useState} from "react-resizable-panels/dist/declarations/src/vendor/react";
import {Link} from "@fluentui/react";
import {useAppState} from "./StateContext";

/**
 * The state for a search panel
 */
export class SearchPanelState extends PanelState {
    public stateType = "search";

    protected type = new Field<"text" | "value">("text");
    protected search = new Field("");

    protected matches = new DataCacher<IValNode[] | {error: string}>(h => {
        const textSearch = this.type.get(h) == "text";
        const searchText = this.search.get(h);

        if (!searchText) return [];
        if (textSearch) {
            try {
                const search = searchText;
                return this.valueNodes.filter(result => {
                    if ("key" in result.value) return false;
                    let text: string | null = null;
                    if (result.value.type == "string") text = result.value.valuePlain;
                    if (result.value.type == "node") text = result.value.name;
                    if (result.value.type == "constr") text = result.value.name;
                    if (result.value.type == "number") text = result.value.value + "";
                    return text?.includes(search);
                });
            } catch (e) {
                return {error: e + ""};
            }
        } else {
            const parseResult = valuePattern.parse(searchText);
            if (!parseResult.status)
                return {
                    error: `Syntax error at index ${
                        parseResult.index.offset
                    }, expected ${intersperseDynamic(parseResult.expected, i =>
                        i == parseResult.expected.length - 1 ? ", or " : ", "
                    ).join("")}`,
                };

            const pattern = parseResult.value;
            return this.valueNodes.filter(result =>
                "key" in result.value ? false : matchesPattern(result.value, pattern)
            );
        }
    });

    protected matchTree = new DataCacher<IValNode[] | null>(h => {
        const parentCount = 2;
        const pathCount = 10;

        let id = -2;
        const root: IValNode = {
            name: "root",
            id: -1,
            children: [],
            parent: null,
            range: 0,
            notOpenable: true,
            value: {type: "boolean", value: true, id: 0}, // Fake placeholder value
        };
        const out: IValNode[] = [root];
        const grouped = new Map<IVal | IEntry, {node: IValNode; children: IValNode[]}>();
        const matches = this.matches.get(h);
        if ("error" in matches) return null;
        for (let match of matches) {
            if (!match.value) continue;

            // Make sure there's a category for this value
            if (!grouped.has(match.value)) {
                const category: IValNode = {
                    ...match,
                    id: id--,
                    parent: -1,
                    children: [],
                    notOpenable: true,
                    role: undefined,
                    controls: {
                        context: [],
                        inline: <ShowAll value={match.value} />,
                    },
                };
                grouped.set(match.value, {
                    node: category,
                    children: [],
                });
                out.push(category);
                root.children.push(category.id);
            }
            const group = grouped.get(match.value)!;

            // Add some ancestors
            const ancestors: IValNode[] = [];
            let topNode = match;
            for (let i = 0; i < parentCount; i++) {
                const parent =
                    topNode.parent != null && this.valueMap.get(topNode.parent);
                if (!parent || parent.parent == null) break;

                const pId = id--;
                const p: IValNode = {
                    ...topNode,
                    parent: pId,
                };
                ancestors.push(p);
                topNode = {
                    ...parent,
                    id: pId,
                    children: [p.id],
                    notOpenable: true,
                };
            }

            // Add the root node to the category
            const path: string[] = [];
            let pathNode = topNode;
            for (let i = 0; i < pathCount; i++) {
                const parent =
                    pathNode.parent != null && this.valueMap.get(pathNode.parent);
                if (!parent || parent.parent == null) break;

                if (pathNode.role) {
                    if (pathNode.role.type == "index")
                        path.push(pathNode.role.index + "");
                    else if (pathNode.role.type == "name") path.push(pathNode.role.name);
                    else if (pathNode.role.type == "key") path.push("key");
                    else if (pathNode.role.type == "value") path.push("value");
                }
                pathNode = parent;
            }

            const topNodeReparented: IValNode = {
                ...topNode,
                role: {
                    type: "name",
                    name: path.reverse().join("."),
                },
                parent: group.node.id,
                controls: {
                    context: [],
                    inline: <Show element={match} />,
                },
            };
            out.push(topNodeReparented);
            out.push(...ancestors.reverse());
            group.children.push(topNodeReparented);
            group.node.children.push(topNodeReparented.id);

            // Add all children
            const index = this.valueNodes.indexOf(match);
            if (index != -1)
                out.push(...this.valueNodes.slice(index + 1, index + 1 + match.range));
        }

        return out;
    });

    /**
     * Sets the current search text
     * @param text The search text (pattern)
     */
    public setSearchText(text: string): void {
        this.search.set(text);
    }

    /**
     * Retrieves the current search text
     * @param hook The hook to subscribe to changes
     * @returns The current search text
     */
    public getSearchText(hook?: IDataHook): string {
        return this.search.get(hook);
    }

    /**
     * Sets the search type
     * @param type The search type to be used
     */
    public setSearchType(type: "text" | "value"): void {
        this.type.set(type);
    }

    /**
     * Retrieves the current search type (whether to search for a structured value, or text match)
     * @param hook The hook to subscribe to changes
     * @returns The current search type
     */
    public getSearchType(hook?: IDataHook): "text" | "value" {
        return this.type.get(hook);
    }

    /**
     * Retrieves the matches according to the current search criteria
     * @param hook The hook to subscribe to changes
     * @returns The results
     */
    public getMatches(hook?: IDataHook): IValNode[] | {error: string} {
        return this.matches.get(hook);
    }

    /**
     * Retrieves the match tree according to the current search criteria
     * @param hook The hook to subscribe to changes
     * @returns The nodes that form a result tree
     */
    public getMatchTree(hook?: IDataHook): IValNode[] | null {
        return this.matchTree.get(hook);
    }
}

const ShowAll: FC<{value: IVal | IEntry}> = ({value}) => {
    const state = useAppState();
    return (
        <Link
            onClick={e => {
                e.stopPropagation();
                state.reveal(value);
                if (!("key" in value)) state.setHighlight(value);
            }}>
            Show all
        </Link>
    );
};
const Show: FC<{element: IValNode}> = ({element}) => {
    const state = useAppState();
    return (
        <Link
            onClick={e => {
                e.stopPropagation();
                state.revealNodes([element]);
            }}>
            Show
        </Link>
    );
};
