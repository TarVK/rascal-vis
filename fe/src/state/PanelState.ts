import {Field, IDataHook} from "model-react";
import {IEntry, IVal} from "../_types/IVal";
import {v4 as uuid} from "uuid";
import {IValNode} from "../_types/IValNode";

/**
 * The state associated to a single shown panel
 */
export class PanelState {
    public readonly valueNodes: IValNode[];
    public readonly value: IVal | IEntry;
    protected id: string = uuid();
    protected closable = new Field<boolean>(false);

    protected visualize = new Field(false);
    protected name = new Field("");
    protected canVisualize = false;

    public constructor(valueNodes: IValNode[]) {
        this.valueNodes = valueNodes;
        this.value = valueNodes[1].value;
    }

    public stateType = "default";

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

    // Visualization
    /**
     * Retrieves whether or not the data is visualized in a fancy way
     * @param hook The hook to subscribe to changes
     * @returns Whether or not the data is visualized
     */
    public isVisualized(hook?: IDataHook): boolean {
        return this.visualize.get(hook) && this.canVisualize;
    }

    /**
     * Whether or not this data can be visualized graphically (instead of text)
     * @returns Whether or not the content can be visualized
     */
    public canBeVisualized(): boolean {
        return this.canVisualize;
    }

    /**
     * Sets whether the data is visualized graphically (instead of text)
     * @param visualized Whether or not the data is visualized
     */
    public setVisualized(visualized: boolean): void {
        this.visualize.set(visualized);
    }
}