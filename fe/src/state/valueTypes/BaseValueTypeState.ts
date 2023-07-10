import {IDataHook} from "model-react";
import {ValuePanelState} from "../ValuePanelState";

/**
 * A base class to represent base values
 */
export abstract class BaseValueTypeState {
    public type: string;
    public description: {name: string; icon?: string} = {name: ""};

    protected panel: ValuePanelState;

    public constructor(panel: ValuePanelState) {
        this.panel = panel;
    }

    /**
     * Checks whether this value type is applicable to the current value in the panel
     * @param hook The hook to subscribe to changes
     * @returns Whether the type is applicable
     */
    public abstract isApplicable(hook?: IDataHook): boolean;

    /**
     * Retrieves the serialization data
     * @returns The serialized data
     */
    public abstract serialize(): any;

    /**
     * Deserializes the data into this object
     * @param value The value to serialize
     */
    public abstract deserialize(value: any): void;
}
