import type {IrEntry} from "~/models/irMaps.server";
import {splitByDot} from "~/utils";
import invariant from "tiny-invariant";
import type * as d3 from "d3";

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
    allNames: [string, string][],
    rootName: string,
    depth: number,
    topCategory: TreeMapNodeCategory,
    renderNames: Set<string>,
    primaryValues: Map<string, IrEntry>,
    secondaryValues: Map<string, IrEntry> | null = null): TreeMapNode {
    const [leafsNames, nonLeafsNames] = allNames
        .reduce(([leafs, nonLeafs], [name, id]) => {
            const split = splitByDot(name);
            if (split.length - 1 == depth) {
                leafs.push([split, [name, id]]);
            } else {
                nonLeafs.push([split, [name, id]]);
            }
            return [leafs, nonLeafs];
        }, [[], []] as [[string[], [string, string]][], [string[], [string, string]][]]);

    const nextChildren = new Map<string, [string, string][]>();
    nonLeafsNames.forEach(([split, name]) => {
        const firstElementArray = nextChildren.has(split[depth]) ? nextChildren.get(split[depth]) : [];
        if (firstElementArray === undefined) {
            throw new Error(`nextChildren has ${split[depth]}, but lookup is undefined`);
        }
        firstElementArray.push(name);
        nextChildren.set(split[depth], firstElementArray);
    });

    const additionalValue = new Map<string, { value: number, shallowValue: number }>();

    let children: TreeMapNode[] = leafsNames
        .filter(([_, [__, id]]) => renderNames.has(id))
        .map(([split, [_, id]]): TreeMapNode => {
            const value = primaryValues.get(id) || {size: 0, type: "unknown"};
            if (secondaryValues !== null) {
                const secondaryValue = secondaryValues.get(id) || {size: 0, type: "unknown"};
                return {
                    name: split[split.length - 1],
                    value: value.size,
                    shallowValue: secondaryValue.size,
                    category: TreeMapNodeCategory.RETAINED,
                    children: []
                };
            }
            return {
                name: split[split.length - 1],
                value: value.size,
                category: topCategory,
                shallowValue: null,
                children: []
            };
        });
    children.forEach(node => {
        if (!nextChildren.has(node.name)) {
            return;
        }
        const old = additionalValue.get(node.name) || {value: 0, shallowValue: 0};
        additionalValue.set(node.name, {
            value: old.value + node.value,
            shallowValue: old.shallowValue + (node.shallowValue || 0)
        });
    });
    children = children.filter(x => !additionalValue.has(x.name));

    nextChildren.forEach((nextNames, name) => {
        const node = buildHierarchy(
            nextNames,
            name,
            depth + 1,
            topCategory,
            renderNames,
            primaryValues,
            secondaryValues
        );
        const additional = additionalValue.get(node.name) || {value: 0, shallowValue: 0};
        if (additional.value !== 0) {
            node.value += additional.value;
        }
        if (additional.shallowValue !== 0) {
            node.shallowValue = (node.shallowValue || 0) + additional.shallowValue;
        }
        children.push(node);
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

export function removeAllSmall(node: d3.HierarchyNode<TreeMapNode>, radius: number): d3.HierarchyNode<TreeMapNode> | null {
    if (node.children?.length === 0) {
        node.children = undefined;
    }
    invariant(node.value !== undefined, `node.value is undefined for ${node.data.name}`);
    if (node.value < radius) {
        return null;
    }
    if (node.children === undefined) {
        return node;
    }
    node.children = node
        .children
        .map(child => removeAllSmall(child, radius))
        .filter((x): x is d3.HierarchyNode<TreeMapNode> => x !== null);
    if (node.children.length === 0) {
        node.children = undefined;
    }
    return node;
}

