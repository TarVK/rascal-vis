import {Field, IDataHook} from "model-react";
import {BaseValueTypeState} from "./BaseValueTypeState";
import {IPlainValueSerialization} from "./_types/IPlainValueSerialization";

/**
 * The data to represent plain text values
 */
export class PlainValueState extends BaseValueTypeState {
    public type = "plain";
    public description = {name: "Text", icon: "FabricTextHighlight"};

    /** The nodes that are expanded */
    public expanded = new Field<Set<string | number>>(new Set());

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
