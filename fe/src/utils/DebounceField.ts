import {Field} from "model-react";

/**
 * A field class that adds a bit of forced debounce delay before calling the listeners about state changes
 */
export class DebounceField<T> extends Field<T> {
    protected timeoutID: number | null;
    protected delay: number;

    /**
     * Creates a new debounce field
     * @param value The initial value of the field
     * @param delay The debounce delay
     */
    public constructor(value: T, delay: number = 100) {
        super(value);
        this.delay = delay;
    }

    protected callListeners(): void {
        if (this.timeoutID) return;
        this.timeoutID = setTimeout(() => {
            this.timeoutID = null;
            super.callListeners();
        }, this.delay) as any;
    }
}
