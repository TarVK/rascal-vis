import {Field, IDataHook} from "model-react";
import {v4 as uuid} from "uuid";
import {IBasePanelSerialization} from "./_types/IBasePanelSerialization";

/**
 * The state associated to a single shown panel
 */
export abstract class PanelState {
    protected id: string;
    protected closable = new Field<boolean>(true);
    protected name = new Field("");

    public constructor(id: string = uuid()) {
        this.id = id;
    }

    public stateType = "none";

    // Tab properties
    /**
     * Retrieves the name of this panel
     * @param hook The hook to subscribe to changes
     * @returns The name of the panel
     */
    public getName(hook?: IDataHook): string {
        return this.name.get(hook);
    }

    /**
     * Sets the new name of the panel
     * @param name The name of the panel
     */
    public setName(name: string): void {
        this.name.set(name);
    }

    /**
     * Whether the panel can be closed
     * @param hook The hook to subscribe to changes
     * @returns Whether the panel can be closed
     */
    public canClose(hook?: IDataHook): boolean {
        return this.closable.get(hook);
    }

    /**
     * Sets whether the panel can be closed
     * @param canClose Whether the panel is closeable
     */
    public setCanClose(canClose: boolean): void {
        this.closable.set(canClose);
    }

    /**
     * Retrieves the ID of the panel
     * @returns The ID of the panel
     */
    public getID(): string {
        return this.id;
    }

    /**
     * Serializes the data of this panel
     * @returns The serialized state data
     */
    public serialize(): IBasePanelSerialization {
        return {
            type: this.stateType,
            id: this.getID(),
            name: this.getName(),
            closable: this.canClose(),
        };
    }

    /**
     * Deserializes the data into this panel
     * @param data The data to be loaded
     */
    public deserialize(data: IBasePanelSerialization): void {
        this.id = data.id;
        this.name.set(data.name);
        this.closable.set(data.closable);
    }
}
