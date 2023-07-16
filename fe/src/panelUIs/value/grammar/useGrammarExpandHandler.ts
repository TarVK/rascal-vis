import {MouseEvent, useMemo} from "react";
import {GrammarValueState} from "../../../state/valueTypes/GrammarValueState";
import {IGrammarExpansionData} from "./_types/IGrammarExpansionData";
import {useDataHook} from "model-react";
import {IValNode} from "../../../_types/IValNode";

/**
 * Retrieves the expand handler given a grammar state
 * @param grammar The grammar state to use
 * The expand handler data
 */
export function useGrammarExpandHandler(
    grammar: GrammarValueState
): IGrammarExpansionData {
    const toggleHandler = useMemo(() => {
        const cache: Record<string | number, (event: MouseEvent) => void> = {};
        return (val: IValNode) => {
            if (!(val.id in cache)) {
                cache[val.id] = event => {
                    event.stopPropagation();
                    event.preventDefault();

                    const newExpanded = new Set(grammar.getExpanded());
                    if (newExpanded.has(val.id)) {
                        // grammar
                        //     .getDescendents(val)
                        //     .forEach(({id}) => newExpanded.delete(id));

                        // If a node is set to be expanded, it might still be displayed as collapsed if not all ancestors are expanded. 
                        // So we either fully expand or collapse dependent on this info
                        const ancestors = grammar.getAncestors(val);
                        const ancestorMissing = ancestors.some(a=>!newExpanded.has(a.id));
                        if(ancestorMissing) ancestors.forEach(({id})=>newExpanded.add(id));
                        else newExpanded.delete(val.id);
                    }
                    else grammar.getAncestors(val).forEach(({id}) => newExpanded.add(id));
                    grammar.setExpanded(newExpanded);
                };
            }
            return cache[val.id];
        };
    }, [grammar]);
    const [h] = useDataHook();
    const expanded = grammar.getExpanded(h);
    return useMemo(() => ({expanded, toggleHandler}), [expanded]);
}
