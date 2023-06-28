import {useEffect, useState} from "react";

/**
 * Uses the current window size and forces a rerender on window size change
 * @returns The current size of the internal area of the window
 */
export const useWindowSize = (): {width: number; height: number} => {
    const [_, update] = useState({});
    useEffect(() => {
        const listener = () => update({});
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, []);

    return {width: window.innerWidth, height: window.innerHeight};
};
