import {DataCacher, Field, IDataHook} from "model-react";
import {IEntry, IVal} from "../_types/IVal";
import {v4 as uuid} from "uuid";
import {IValNode} from "../_types/IValNode";
import {PanelState} from "./PanelState";
import {IValuePanelSerialization} from "./_types/IValuePanelSerialization";
import {BaseValueTypeState} from "./valueTypes/BaseValueTypeState";
import {PlainValueState} from "./valueTypes/PlainValueState";

/**
 * The state associated to a single shown panel
 */
export class ValuePanelState extends PanelState {
    public stateType = "value";

    // Value data
    protected valueNodes = new Field<IValNode[]>([]);
    protected valueMap = new DataCacher(h => {
        const out = new Map<string | number, IValNode>();
        for (let node of this.valueNodes.get(h)) out.set(node.id, node);
        return out;
    });
    public readonly value = new DataCacher<IVal | IEntry>(
        h => this.valueNodes.get(h)[1]?.value ?? null
    );

    // Value type data
    protected types: BaseValueTypeState[];
    protected selectedType: Field<BaseValueTypeState>;

    // Reveal listeners
    protected onRevealListeners: Set<(values: Set<IValNode>) => void> = new Set();
    protected revealed: Set<IValNode> | undefined;

    public constructor(valueNodes: IValNode[]) {
        super();
        this.valueNodes.set(valueNodes);
        this.types = [new PlainValueState(this)];
        this.selectedType = new Field(this.types[0]);
    }

    // /**
    //  * Creates a new value panel state and initializes the type data
    //  * @param valueNodes
    //  */
    // public static create(valueNodes: IValNode[]) {
    //     const panel = new ValuePanelState(valueNodes);
    //     panel.types = [new PlainValueState(panel)];
    // }

    /**
     * Sets the new value nodes
     * @param valueNodes The value nodes to be set
     */
    public setValueNodes(valueNodes: IValNode[]): void {
        this.valueNodes.set(valueNodes);
    }

    /**
     * Retrieves the value nodes
     * @param hook The hook to subscribe to changes
     * @returns The current value nodes
     */
    public getValueNodes(hook?: IDataHook): IValNode[] {
        return this.valueNodes.get(hook);
    }

    // Type management
    /**
     * Retrieves the currently selected/applicable value type
     * @param hook The hook to subscribe to changes
     * @returns The selected value type
     */
    public getSelectedType(hook?: IDataHook): BaseValueTypeState {
        const selected = this.selectedType.get(hook);
        if (selected.isApplicable(hook)) return selected;

        return this.getApplicableTypes(hook)[0];
    }

    /**
     * Selects the given value type if applicable
     * @param type The type to be selected
     */
    public selectType(type: BaseValueTypeState): void {
        this.selectedType.set(type);
    }

    /**
     * Retrieves the currently applicable value types
     * @param hook The hook to subscribe to changes
     * @returns The applicable value types
     */
    public getApplicableTypes(hook?: IDataHook): BaseValueTypeState[] {
        return this.types.filter(type => type.isApplicable(hook));
    }

    // Global interactions
    /**
     * Reveals the given value
     * @param value The value to be revealed
     * @returns Whether any nodes were shown
     */
    public reveal(nodes: Set<IValNode>): boolean {
        let out = new Set<IValNode>();
        const map = this.valueMap.get();
        let added = new Set([...nodes].filter(node => map.has(node.id)));
        while (added.size != 0) {
            const newAdded = new Set<IValNode>();
            for (let node of added) {
                const parent = node.parent != null ? map.get(node.parent) : null;
                if (!parent || nodes.has(parent)) continue;
                newAdded.add(parent);
                out.add(parent);
            }
            added = newAdded;
        }

        this.revealed = out;
        for (let listener of this.onRevealListeners) listener(out);
        return out.size > 0;
    }

    /**
     * Adds a listener to listen for what nodes to be expanded (to handle reveals)
     * @param listener The listener to be invoked when a value is revealed
     * @returns A function that can be used to remove the listener
     */
    public addExpandListener(listener: (value: Set<IValNode>) => void): () => void {
        if (this.revealed) listener(this.revealed);
        this.onRevealListeners.add(listener);
        return () => this.onRevealListeners.delete(listener);
    }

    // Serialization
    /**
     * Serializes the data of this panel
     * @returns The serialized state data
     */
    public serialize(): IValuePanelSerialization {
        return {
            ...super.serialize(),
            selectedType: this.selectedType.get().type,
            types: this.types.map(type => type.serialize()),
        };
    }

    /**
     * Deserializes the data into this panel
     * @param data The data to be loaded
     */
    public deserialize(data: IValuePanelSerialization): void {
        super.deserialize(data);
        data.types.forEach(typeData => {
            const type = this.types.find(type => type.type == typeData.type);
            if (!type) return;
            type.deserialize(typeData);
        });
    }
}
