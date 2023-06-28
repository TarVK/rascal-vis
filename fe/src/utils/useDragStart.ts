import {useEffect, useRef} from "react";
import {IPoint} from "./_types/IPoint";

/**
 * A hook that can be used to add a drag event start listener
 * @param onDrag The callback to trigger when dragged
 * @param distanceThreshold The minimum distance to move before considering it a drag
 * @returns A reference to be added to the div for which to detect dragging
 */
export const useDragStart = (
    onDrag: (start: IPoint, offset: IPoint) => void,
    distanceThreshold: number = 10
) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let offset: null | IPoint = null;
        let origin: null | IPoint = null;
        const downListener = (event: MouseEvent) => {
            origin = event;
            window.addEventListener("mousemove", moveListener);
            const bounds = el.getBoundingClientRect();
            offset = {
                x: bounds.x - event.pageX,
                y: bounds.y - event.pageY,
            };
        };
        const moveListener = (event: MouseEvent) => {
            if (!origin) return;
            const distance = getDistance(event, origin);
            if (distanceThreshold < distance) {
                origin = null;
                onDrag(
                    {
                        x: event.pageX,
                        y: event.pageY,
                    },
                    offset ?? {x: 0, y: 0}
                );
            }
        };
        const resetListener = () => {
            origin = null;
            window.removeEventListener("mousemove", moveListener);
        };
        el.addEventListener("mousedown", downListener);
        el.addEventListener("mouseenter", resetListener);
        el.addEventListener("mouseup", resetListener);
        return () => {
            el.removeEventListener("mousedown", downListener);
            window.removeEventListener("mousemove", moveListener);
            el.removeEventListener("mouseenter", resetListener);
            el.removeEventListener("mouseup", resetListener);
        };
    }, []);
    return ref;
};

function getDistance(a: IPoint, b: IPoint): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
