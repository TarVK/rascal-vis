import {useMemo, MouseEvent} from "react";
import {IValNode} from "../../../_types/IValNode";
import {
    IGrammarClickData,
    IGrammarInteractionHandler,
} from "./_types/IGrammarInteractionHandler";

/**
 * Creates the interaction handler with the
 * @param onClick The click handler to use
 * @param onContext The on context open handler to use
 * @param onHover The hover handler to use
 * @returns The interaction handler that caches handlers
 */
export function useGrammarInteractionHandler(
    onClick: (value: IValNode, data: IGrammarClickData) => void,
    onContext: (value: IValNode, data: IGrammarClickData, event: MouseEvent) => void,
    onHover: (value: IValNode | null, data: IGrammarClickData | null) => void
): IGrammarInteractionHandler {
    return useMemo<IGrammarInteractionHandler>(() => {
        const hoverStack: [IValNode, IGrammarClickData][] = [];
        const map = new Map<
            number | string,
            {
                onMouseEnter: () => void;
                onMouseLeave: () => void;
                onClick: (event: MouseEvent) => void;
                onContextMenu: (event: MouseEvent) => void;
            }
        >();

        return (value: IValNode, data: IGrammarClickData) => {
            const handler = map.get(value.id);
            if (handler) return handler;

            const newHandler = {
                onMouseEnter: () => {
                    hoverStack.push([value, data]);
                    onHover(value, data);
                },
                onMouseLeave: () => {
                    const reverseIndex = [...hoverStack]
                        .reverse()
                        .findIndex(([val]) => val.id == value.id);
                    if (reverseIndex == -1) return;
                    const index = hoverStack.length - 1 - reverseIndex;
                    hoverStack.splice(index, 1);
                    const top = hoverStack[hoverStack.length - 1] ?? [null, null];
                    onHover(top[0], top[1]);
                },
                onClick: (event: MouseEvent) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick(value, data);
                },
                onContextMenu: (event: MouseEvent) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onContext(value, data, event);
                },
            };
            map.set(value.id, newHandler);
            return newHandler;
        };
    }, [onHover, onClick, onContext]);
}
