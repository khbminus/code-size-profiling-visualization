import {splitByDot} from "~/utils";
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

export function processNames(names: string[]): Node[] {
    const splitNames: string[][] = names.map(splitByDot);
    let root: LookupNode = {label: "", value: "", children: new Map(), isTerminal: false}
    splitNames.forEach(split => {
            let currentVertex = root;
            let depth = 0;
            let value = "";
            while (depth < split.length) {
                if (depth > 0) {
                    value = value.concat(".");
                }
                value = value.concat(split[depth]);
                let nextNode = currentVertex.children.get(split[depth]);
                if (nextNode === undefined) {
                    nextNode = {label: split[depth], value: value, children: new Map(), isTerminal: false}
                    currentVertex.children.set(split[depth], nextNode);
                }
                depth++;
                currentVertex = nextNode;
            }
            currentVertex.isTerminal = true;
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