import {IDataHook} from "model-react";
import {BaseValueTypeState} from "./BaseValueTypeState";
import {IPlainValueSerialization} from "./_types/IPlainValueSerialization";

/**
 * The data to represent plain text values
 */
export class PlainValueState extends BaseValueTypeState {
    public type = "plain";
    public description = {name: "Text", icon: "FabricTextHighlight"};

    /** @override */
    public isApplicable(hook?: IDataHook): boolean {
        return true;
    }

    /** @override */
    public serialize(): IPlainValueSerialization {
        return {
            type: "plain",
        };
    }

    /** @override */
    public deserialize(value: IPlainValueSerialization): void {}
}
