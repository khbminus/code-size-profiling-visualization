import {useEffect, useState} from "react";
import type {IrEntry, IrMap} from "~/models/irMaps.server";

export const linkClassName = "font-medium text-blue-600 underline hover:no-underline";
const complement = {")": "(", "]": "[", ">": "<", "}": "{"};

function propagate(c: string, stack: string[]) {
    if (c === "(" || c === "{" || c == "<" || c == "[") {
        stack.push(c);
    } else if (c === ")" || c === "}" || c === ">" || c === "]") {
        while (stack.length > 1 && stack[stack.length - 1] != complement[c]) {
            stack.pop();
        }
        stack.pop();
    }
}
export function splitByDot(x: string): string[] {
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
        propagate(c, stack);
        current = current.concat(c);
    });
    if (current.length > 0) {
        res.push(current);
    }
    return res;
}

export function splitByDotWithDelimiter(x: string): [string, string][] {
    const chars = [...x]
    const stack: string[] = []
    const res: [string, string][] = []
    let current = ""
    chars.forEach(c => {
        if (c === "." || c == "/") {
            if (stack.length === 0) {
                res.push([current, c])
                current = "";
            } else {
                current = current.concat(c);
            }
            return;
        }
        propagate(c, stack);
        current = current.concat(c);
    });
    if (current.length > 0) {
        res.push([current, ""]);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [value, delay],
    );

    return debouncedValue;
}

export function buildIrMap(obj: IrMap): Map<string, IrEntry> {
    return new Map(
        Object
            .entries(obj)
            .map(([name, obj]) =>
                [obj.displayName || name, obj]
            )
    )
}