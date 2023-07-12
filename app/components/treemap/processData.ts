import type {IrEntry} from "~/models/irMaps.server";

export enum TreeMapNodeCategory {
    /** The leaf node that holds retained and shallow sizes*/
    RETAINED,
    /** Synthetic middle node that partial fqn*/
    MIDDLE,
    /** The leaf node that holds only shallow size*/
    SHALLOW

}

export type TreeMapNode = {
    name: string,
    children: TreeMapNode[],
    category: TreeMapNodeCategory,
    value: number,
    shallowValue: number | null,
}

export function buildHierarchy(
    allNames: Array<string>,
    rootName: string,
    depth: number,
    topCategory: TreeMapNodeCategory,
    primaryValues: Map<string, IrEntry>,
    secondaryValues: Map<string, IrEntry> | null = null): TreeMapNode {
    const [leafsNames, nonLeafsNames] = allNames
        .reduce(([leafs, nonLeafs], elem) => {
            const split = splitByDot(elem);
            if (split.length - 1 == depth) {
                leafs.push([split, elem]);
            } else {
                nonLeafs.push([split, elem]);
            }
            return [leafs, nonLeafs];
        }, [[], []] as [[string[], string][], [string[], string][]]);
    const children: TreeMapNode[] = leafsNames
        .map(([split, name]): TreeMapNode => {
            const visualName = split[split.length - 1];
            const value = primaryValues.get(name) || {size: 0, type: "unknown"};
            if (secondaryValues !== null) {
                const secondaryValue = secondaryValues.get(name) || {size: 0, type: "unknown"};
                return {
                    name: visualName,
                    value: value.size,
                    shallowValue: secondaryValue.size,
                    category: TreeMapNodeCategory.RETAINED,
                    children: []
                };
            }
            return {
                name: visualName,
                value: value.size,
                category: topCategory,
                shallowValue: null,
                children: []
            };
        });

    const nextChildren = new Map<string, string[]>();
    nonLeafsNames.forEach(([split, name]) => {
        const firstElementArray = nextChildren.has(split[depth]) ? nextChildren.get(split[depth]) : [];
        if (firstElementArray === undefined) {
            throw new Error(`nextChildren has ${split[depth]}, but lookup is undefined`);
        }
        firstElementArray.push(name);
        nextChildren.set(split[depth], firstElementArray);
    });
    nextChildren.forEach((nextNames, name) => {
        children.push(buildHierarchy(
            nextNames,
            name,
            depth + 1,
            topCategory,
            primaryValues,
            secondaryValues
        ));
    });
    return {
        name: rootName,
        category: TreeMapNodeCategory.MIDDLE,
        children: children,
        shallowValue: children
            .reduce((a: number | null, b) =>
                (a === null || b.shallowValue === null) ? null : a + b.shallowValue, 0),
        value: 0
    }
}

export function removeAllSmall(node: TreeMapNode, radius: number): TreeMapNode | number {
    if (node.children.length === 0) {
        return node.value >= radius ? node : node.value;
    }
    const [additionalValues, leafs] = node
        .children
        .map(child => removeAllSmall(child, radius))
        .reduce(([add, lf], child) => {
            if (typeof child === "number") {
                add.push(child);
            } else {
                lf.push(child);
            }
            return [add, lf];
        }, [[], []] as [number[], TreeMapNode[]]);
    return {
        name: node.name,
        shallowValue: node.shallowValue,
        children: leafs,
        category: node.category,
        value: node.value + additionalValues.reduce((a, b) => a + b, 0)
    };
}

export function splitByDot(x: string): string[] {
    const complement = {")": "(", "]": "[", ">": "<", "}": "{"};
    const chars = [...x]
    const stack: string[] = []
    const res: string[] = []
    let current = ""
    chars.forEach(c => {
        if (c === ".") {
            if (stack.length === 0) {
                res.push(current)
                current = "";
            } else {
                current = current.concat(".");
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