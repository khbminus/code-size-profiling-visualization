import {splitByDot} from "~/utils";
import invariant from "tiny-invariant";

type LookupNode = {
    label: string,
    value: string,
    children: Map<string, LookupNode>
}
export type Node = {
    label: string,
    value: string,
    children?: Array<Node>,
    title?: string
}

export function processNames(names: string[]): Node[] {
    const splitNames: [string, string[]][] = names.map(x => [x, splitByDot(x)]);
    let root: LookupNode = {label: "", value: "", children: new Map()}
    splitNames.forEach(([name, split]) => {
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
                    nextNode = {label: split[depth], value: value, children: new Map()}
                    currentVertex.children.set(split[depth], nextNode);
                }
                depth++;
                currentVertex = nextNode;
            }
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
    return {
        label: node.label,
        value: node.value,
        children: children
    };
}