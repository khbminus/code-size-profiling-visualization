import {useEffect, useState} from "react";

export const linkClassName = "font-medium text-blue-600 underline hover:no-underline";

export function splitByDot(x: string): string[] {
    const complement = {")": "(", "]": "[", ">": "<", "}": "{"};
    const chars = [...x]
    const stack: string[] = []
    const res: string[] = []
    let current = ""
    let stopSymbol = chars.findIndex(x => x === '|')
    if (stopSymbol === -1) {
        stopSymbol = chars.length
    }
    chars.slice(0, stopSymbol).forEach(c => {
        if (c === "." || c == "/") {
            if (stack.length === 0) {
                res.push(current)
                current = "";
            } else {
                current = current.concat(c);
            }
            return;
        }
        if (c === "(" || c === "{" || c == "<" || c == "[") {
            stack.push(c);
        } else if (c === ")" || c === "}" || c === ">" || c === "]") {
            while (stack.length > 1 && stack[stack.length - 1] != complement[c]) {
                stack.pop();
            }
            stack.pop();
        }
        current = current.concat(c);
    });
    if (current.length > 0) {
        res.push(current);
    }
    return res;
}

export function useDebounce<T>(value: T, delay: number): T {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(
        () => {
            const handler = setTimeout(() => {
                if (value !== debouncedValue) setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay],
    );

    return debouncedValue;
}