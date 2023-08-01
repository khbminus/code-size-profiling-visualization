import {splitByDotWithDelimiter} from "~/utils";
import invariant from "tiny-invariant";
import type {ReactNode} from "react";

type LookupNode = {
    label: string,
    value: string,
    children: Map<string, LookupNode>,
    isTerminal: boolean
}
export type Node = {
    label: ReactNode,
    value: string,
    children?: Array<Node>,
    title?: string
}

export function processNames(names: [string, string][]): Node[] {
    const splitNames: [[string, string][], string][] = names.map(([x, y]) => [splitByDotWithDelimiter(x), y]);
    let root: LookupNode = {label: "", value: "", children: new Map(), isTerminal: false}
    splitNames.forEach(([split, label]) => {
            let currentVertex = root;
            let depth = 0;
            let value = "";
            while (depth + 1 < split.length) {
                if (depth > 0) {
                    value = value.concat(split[depth - 1][1]);
                }
                value = value.concat(split[depth][0]);
                let nextNode = currentVertex.children.get(split[depth][0]);
                if (nextNode === undefined) {
                    nextNode = {label: split[depth][0], value: value, children: new Map(), isTerminal: false}
                    currentVertex.children.set(split[depth][0], nextNode);
                }
                depth++;
                currentVertex = nextNode;
            }
            const terminalNode = {label: split[depth][0], value: label, children: new Map(), isTerminal: true};
            currentVertex.children.set(label, terminalNode);
        }
    );
    const converted = convertNode(root);
    invariant(converted.children !== undefined, "Only leaf vertex");
    return converted.children;
}

function convertNode(node: LookupNode): Node {
    const children = [...node.children.values()].map(convertNode);
    if (children.length == 0) {
        return {
            label: node.label,
            value: node.value,
            title: node.value
        }
    }
    if (children.length !== 0 && node.isTerminal) {
        children.push({label: `${node.label} (Class)`, value: node.value, title: node.value});
        return {
            label: node.label,
            value: `${node.value} (Non-leaf)`,
            children: children
        }
    }
    return {
        label: node.label,
        value: node.value,
        children: children
    };
}