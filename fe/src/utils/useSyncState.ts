import {Dispatch, SetStateAction, useEffect, useState} from "react";

/**
 * A standard react state, except it resynchronizes on source/init value changes
 */
export function useSyncState<T>(init: T): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState(init);
    useEffect(() => {
        setValue(init);
    }, [init]);
    return [value, setValue];
}
