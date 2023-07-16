import {useCallback, useState, useEffect} from "react";
import {ITreeViewOnExpandProps} from "react-accessible-treeview";
import {PlainValueState} from "../../../state/valueTypes/PlainValueState";
import {ValuePanelState} from "../../../state/ValuePanelState";

export function useExpandState(
    panel: ValuePanelState,
    textState: PlainValueState
): [(string | number)[], (props: ITreeViewOnExpandProps) => void] {
    const [expandNodes, setExpandNodes] = useState<(string | number)[]>([]);
    useEffect(
        () =>
            panel.addExpandListener(nodes =>
                setExpandNodes([...nodes].map(node => node.id))
            ),
        [panel]
    );
    useEffect(() => {
        setExpandNodes(textState.getExpanded());
    }, []);

    return [
        expandNodes,
        useCallback(
            props => {
                textState.setExpanded(props.treeState.expandedIds);
            },
            [textState]
        ),
    ];
}
