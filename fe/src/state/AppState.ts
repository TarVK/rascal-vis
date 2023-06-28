import {DataCacher, Field} from "model-react";
import {IVal} from "../_types/IVal";
import {value} from "../parse/parser";
import {Failure, Result} from "parsimmon";
import {dataAddress} from "../dataAddress";

/**
 * Representing all application state data
 */
export class AppState {
    protected valueText = new Field<null | string>(null);
    protected parseData = new DataCacher<null | Result<IVal>>(h => {
        const text = this.valueText.get(h);
        if (text == null) return null;
        return value.parse(text);
    });

    /**
     * A parse error, if any mistakes in parsing occurred (shouldn't happen, but maybe if we have implementation mistakes)
     */
    public parseError = new DataCacher<null | Failure>(h => {
        const result = this.parseData.get(h);
        if (result?.status == false) return result;
        return null;
    });

    /**
     * The value that's being visualized
     */
    public value = new DataCacher<null | IVal>(h => {
        const result = this.parseData.get(h);
        if (result?.status) return result.value;
        return null;
    });

    /**
     * Tries to load the latest value from the server
     */
    public async loadValue(): Promise<void> {
        try {
            const dataResponse = await fetch(dataAddress);
            const dataText = await dataResponse.text();
            if (this.valueText.get() != dataText) this.valueText.set(dataText);
        } catch {
            this.valueText.set(null);
        }
    }
}
