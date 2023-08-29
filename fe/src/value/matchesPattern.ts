import {IRegex, ITextPattern, IVal, IValPlainPattern} from "../_types/IVal";

/**
 * Checks whether a given node matches a pattern
 * @param node The node to check
 * @param pattern The pattern to check against
 * @returns Whether the node matches the pattern
 */
export function matchesPattern(node: IVal, pattern: IValPlainPattern): boolean {
    if (pattern.type == "repeat") return false;
    else if (pattern.type == "any") return true;
    else if (pattern.type == "textPattern")
        return node.type == "string" && node.valuePlain.includes(pattern.valuePlain);
    else if (pattern.type == "regex")
        return node.type == "string" && node.valuePlain.search(pattern.regex) != -1;
    else if (pattern.type == "or")
        return pattern.options.some(p => matchesPattern(node, p));
    else if (pattern.type == "boolean") {
        if (node.type != "boolean") return false;
        return node.value == pattern.value;
    } else if (pattern.type == "number") {
        if (node.type != "number") return false;
        return node.value == pattern.value;
    } else if (pattern.type == "string") {
        if (node.type != "string") return false;
        return node.valuePlain == pattern.valuePlain;
    } else if (pattern.type == "location") {
        if (node.type != "location") return false;
        if (node.uri != pattern.uri) return false;
        if (!pattern.position) return !node.position;
        if (!node.position) return !pattern.position;
        return (
            node.position.start.line == pattern.position.start.line &&
            node.position.start.column == pattern.position.start.column &&
            node.position.end.line == pattern.position.end.line &&
            node.position.end.column == pattern.position.end.column &&
            node.position.offset.start == pattern.position.offset.start &&
            node.position.offset.end == pattern.position.offset.end
        );
    } else {
        function matchesSequence(
            sequence: IVal[],
            sequenceStart: number,
            pattern: IValPlainPattern[]
        ): boolean {
            if (pattern.length == 0) return sequence.length == sequenceStart;
            if (sequenceStart >= sequence.length) return false;

            const [first, ...remainderPattern] = pattern;
            if (first.type == "or") {
                return first.options.some(option =>
                    matchesSequence(sequence, sequenceStart, [
                        option,
                        ...remainderPattern,
                    ])
                );
            } else if (first.type == "repeat") {
                const seqLength = sequence.length - sequenceStart;
                let maxReach = 0;
                for (maxReach = 0; maxReach < seqLength; maxReach++)
                    if (!matchesPattern(sequence[maxReach + sequenceStart], first.value))
                        break;

                for (let end = maxReach + sequenceStart; end >= sequenceStart; end--) {
                    if (matchesSequence(sequence, end, remainderPattern)) return true;
                }
            } else {
                if (!matchesPattern(sequence[sequenceStart], first)) return false;

                return matchesSequence(sequence, sequenceStart + 1, remainderPattern);
            }
            return false;
        }

        function matchesText(
            text: string,
            pattern: string | IRegex | ITextPattern
        ): boolean {
            if (typeof pattern == "string") {
                return text == pattern;
            } else if (pattern.type == "regex") {
                return text.search(pattern.regex) != -1;
            } else {
                return text.includes(pattern.valuePlain);
            }
        }

        if (pattern.type == "constr" || pattern.type == "node") {
            if (!(node.type == "constr" || node.type == "node")) return false;

            if (!matchesText(node.name, pattern.name)) return false;

            if (!matchesSequence(node.children, 0, pattern.children)) return false;

            return node.namedChildren.every(({name, value}) =>
                pattern.namedChildren.some(({name: namePattern, value: valuePattern}) => {
                    if (!matchesText(name, namePattern)) return false;
                    if (!matchesPattern(value, valuePattern)) return false;
                    return true;
                })
            );
        } else if (pattern.type == "list" || pattern.type == "tuple") {
            if (node.type != pattern.type) return false;
            return matchesSequence(node.children, 0, pattern.children);
        } else if (pattern.type == "set") {
            if (node.type != "set") return false;
            let unmatchedPatterns = new Set(pattern.children);

            // Note, we both check that every value is included in the pattern, and all parts of the pattern are included in some value.
            for (const value of node.children) {
                let matchesSome = false;
                for (const valuePattern of pattern.children) {
                    if (matchesPattern(value, valuePattern)) {
                        matchesSome = true;
                        unmatchedPatterns.delete(valuePattern);
                    }
                }
                if (!matchesSome) return false;
            }

            return unmatchedPatterns.size == 0;
        } else if (pattern.type == "map") {
            if (node.type != "map") return false;

            // Note, we both check that every value is included in the pattern, and all parts of the pattern are included in some value.
            let unmatchedPatterns = new Set(pattern.children);
            for (const {key, value} of node.children) {
                let matchesSome = false;
                for (const p of pattern.children) {
                    const {key: keyPattern, value: valuePattern} = p;

                    if (!matchesPattern(key, keyPattern)) continue;
                    if (!matchesPattern(value, valuePattern)) continue;

                    matchesSome = true;
                    unmatchedPatterns.delete(p);
                }
                if (!matchesSome) return false;
            }

            return unmatchedPatterns.size == 0;
        }
    }
    return false;
}
