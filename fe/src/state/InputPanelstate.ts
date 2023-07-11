import {Field, IDataHook} from "model-react";
import {AppState} from "./AppState";
import {PanelState} from "./PanelState";
import {
    IInputPanelSerialization,
    ISelectedInput,
} from "./_types/IInputPanelSerialization";

/**
 * A panel state that determines the input data of the application
 */
export class InputPanelState extends PanelState {
    public stateType = "input";
    protected state: AppState;

    protected selectedInput = new Field<ISelectedInput>("server");
    protected address = new Field("http://localhost:10001/data");
    protected pollInterval = new Field(500);
    protected textValue = new Field("");
    protected fetchFail = new Field<Error | null>(null);

    protected timeoutID: number;
    protected sentFetchID: number = 0;
    protected receivedFetchID: number = -1;

    public constructor(appState: AppState) {
        super("input");
        this.state = appState;
    }

    /**
     * Tries to load the latest value from the server
     */
    public async loadValue(): Promise<void> {
        const fetchID = this.sentFetchID++;
        try {
            let dataResponse;
            try {
                dataResponse = await fetch(this.address.get(), {
                    method: "GET",
                });
            } catch (e) {
                // Fetch without CORS mode, to see if the domain is reachable
                try {
                    await fetch(this.address.get(), {
                        method: "GET",
                        mode: "no-cors",
                    });
                } catch (e) {
                    throw new ServerDownError(e.message);
                }
                throw new CorsError();
            }
            if (!dataResponse.ok) {
                if (dataResponse.status == 404) {
                    throw new PathNotFoundError();
                }
                throw Error(dataResponse.statusText);
            }

            const dataText = await dataResponse.text();

            const resolvedLaterAttempt =
                fetchID < this.receivedFetchID || this.selectedInput.get() != "server";
            if (resolvedLaterAttempt) return;

            if (this.state.getValueText() != dataText) this.state.setValueText(dataText);
            this.fetchFail.set(null);
        } catch (e) {
            const resolvedLaterAttempt =
                fetchID < this.receivedFetchID || this.selectedInput.get() != "server";
            if (resolvedLaterAttempt) return;
            this.state.setValueText(null);
            this.fetchFail.set(e);
        }
        this.receivedFetchID = fetchID;
    }

    /**
     * Sets the input source to be used
     * @param source The input source to be used
     * @param delay Whether to delay the initial fetch
     */
    public setInputSourceType(source: ISelectedInput, delay: boolean = false): void {
        this.selectedInput.set(source);

        clearTimeout(this.timeoutID);
        if (source == "manual") {
            this.state.setValueText(this.textValue.get());
        } else {
            const loadNext = () => {
                if (this.selectedInput.get() != "server") return;
                this.loadValue();
                this.timeoutID = setTimeout(loadNext, this.pollInterval.get()) as any;
            };
            if (delay)
                this.timeoutID = setTimeout(loadNext, this.pollInterval.get()) as any;
            else loadNext();
        }
    }

    /**
     * Sets the manual input text
     * @param text The text to be set
     */
    public setInputText(text: string): void {
        this.textValue.set(text);
        if (this.selectedInput.get() == "manual") this.state.setValueText(text);
    }

    // Simple getters/setters
    /**
     * Retrieves the latest fetch fail, or null if the fetch was successful
     * @param hook The hook to subscribe to changes
     * @returns The latest fetch's failure info
     */
    public getFetchFail(hook?: IDataHook): Error | null {
        return this.fetchFail.get(hook);
    }

    /**
     * Retrieves the current manual input text
     * @param hook The hook to subscribe to changes
     * @returns The current input text
     */
    public getInputText(hook?: IDataHook): string {
        return this.textValue.get(hook);
    }

    /**
     * Retrieves the currently selected source type to use
     * @param hook The hook to subscribe to changes
     * @returns The currently selected source type
     */
    public getInputSourceType(hook?: IDataHook): ISelectedInput {
        return this.selectedInput.get(hook);
    }

    /**
     * Sets the poll interval in milliseconds
     * @param intervalMS The poll interval in milliseconds
     */
    public setPollInterval(intervalMS: number): void {
        this.pollInterval.set(intervalMS);
    }

    /**
     * Retrieves the poll interval in milliseconds
     * @param hook The hook to subscribe to changes
     * @returns The current poll interval in milliseconds
     */
    public getPollInterval(hook?: IDataHook): number {
        return this.pollInterval.get(hook);
    }

    /**
     * Sets the input source address
     * @param address The source address to obtain inputs from
     */
    public setInputSourceAddress(address: string): void {
        this.address.set(address);
    }

    /**
     * Retrieves the input source address
     * @param hook The hook to subscribe to changes
     * @returns The current address
     */
    public getInputSourceAddress(hook?: IDataHook): string {
        return this.address.get(hook);
    }

    // Serialization
    /** @override */
    public serialize(): IInputPanelSerialization {
        return {
            ...super.serialize(),
            address: this.address.get(),
            pollInterval: this.pollInterval.get(),
            selected: this.selectedInput.get(),
            textValue: this.textValue.get(),
        };
    }

    /** @override */
    public deserialize(data: IInputPanelSerialization): void {
        super.deserialize(data);
        this.address.set(data.address);
        this.pollInterval.set(data.pollInterval);
        this.textValue.set(data.textValue);
        this.setInputSourceType(data.selected);
    }
}

export class ServerDownError extends Error {}
export class PathNotFoundError extends Error {}
export class CorsError extends Error {}
