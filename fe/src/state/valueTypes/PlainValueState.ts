import {DataCacher, Field, IDataHook} from "model-react";
import {BaseValueTypeState} from "./BaseValueTypeState";
import {IPlainValueSerialization} from "./_types/IPlainValueSerialization";
import { AppState } from "../AppState";
import { ValuePanelState } from "../ValuePanelState";

/**
 * The data to represent plain text values
 */
export class PlainValueState extends BaseValueTypeState {
    public type = "plain";
    public description = {name: "Text", icon: "FabricTextHighlight"};

    /** The nodes that are expanded */
    protected expanded = new Field<Set<(string | number)>>(new Set());
    protected expandedFiltered = new DataCacher(h=>{
        const expanded = [...this.expanded.get(h)];
        const nodeMap = this.panel.valueMap.get(h);
        return expanded.filter((id)=>nodeMap.has(id));
    });

    /**
     * Updates the nodes that are currently expanded
     * @param expanded The nodes that are now expanded
     */
    public setExpanded(expanded: Set<string | number>){
        this.expanded.set(expanded);
    }

    /**
     * Retrieves the ids of all nodes that are currently expanded
     * @param hook The hook to subscrive to changes
     * @returns ALl currently expanded nodes
     */
    public getExpanded(hook?: IDataHook): (string | number)[] {
        return this.expandedFiltered.get(hook);
    }


    /** @override */
    public isApplicable(hook?: IDataHook): boolean {
        return true;
    }

    /** @override */
    public serialize(): IPlainValueSerialization {
        return {
            type: "plain",
            expanded: [...this.expanded.get()],
        };
    }

    /** @override */
    public deserialize(value: IPlainValueSerialization): void {
        this.expanded.set(new Set(value.expanded));
    }
}
