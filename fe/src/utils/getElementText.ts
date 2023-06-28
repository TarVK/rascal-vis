import {renderToString} from "react-dom/server";

/**
 * Retrieves the inner text of a jsx element
 * @param element The element to get the text content from
 * @returns The text content
 */
export function getElementText(element: JSX.Element): string {
    const curVisible = renderToString(element);
    const placeholder = document.createElement("div");
    placeholder.innerHTML = curVisible;
    return placeholder.innerText;
}
