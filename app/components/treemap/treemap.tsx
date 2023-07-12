import type {IrEntry} from "~/models/irMaps.server";
import type {TreeMapNodeCategory, TreeMapNode} from "~/components/treemap/processData";
import {buildHierarchy, removeAllSmall} from "~/components/treemap/processData";
import {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import {TreeMapRenderer} from "~/components/treemap/rendering";
import invariant from "tiny-invariant";

export enum TreeMapViewMode {
    ALL = "Show retained and shallow sizes",
    SHALLOW = "Show only shallow sizes",
    RETAINED = "Show only retained sizes"
}

export interface TreeMapProps {
    renderableNames: string[] // TODO: maybe change it
    minimumRadius: number,
    primaryIrMap: Map<string, IrEntry>,
    secondaryIrMap: Map<string, IrEntry> | null,
    topCategory: TreeMapNodeCategory,
    width: number,
    height: number
}

export default function TreeMap(props: TreeMapProps) {
    const {
        renderableNames,
        minimumRadius,
        primaryIrMap,
        secondaryIrMap,
        topCategory,
        width,
        height
    } = props;

    const svgRef = useRef(null);
    const tilingFunction = (node: d3.HierarchyRectangularNode<any>, x0: number, y0: number, x1: number, y1: number) => {
        d3.treemapBinary(node, 0, 0, width, height);
        if (node.children === undefined) {
            return;
        }
        for (const child of node.children) {
            child.x0 = x0 + child.x0 / width * (x1 - x0);
            child.x1 = x0 + child.x1 / width * (x1 - x0);
            child.y0 = y0 + child.y0 / height * (y1 - y0);
            child.y1 = y0 + child.y1 / height * (y1 - y0);
        }
    }
    const treemap = d3
        .treemap<TreeMapNode>()
        .tile(tilingFunction);
    const tree = removeAllSmall(
        buildHierarchy(renderableNames, "Kotlin IR", 0, topCategory, primaryIrMap, secondaryIrMap),
        minimumRadius
    );
    invariant(typeof tree !== "number", "Couldn't find suitable tree");

    const hierarchy = d3
        .hierarchy(tree)
        .sum(d => d.value);

    const builtTreeMap = treemap(hierarchy);

    const [currentPath, setPath] = useState(["Kotlin IR"]);

    useEffect(() => {
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height);
        svg.selectAll("*").remove();
        const svgTreeGroup = svg
            .append("g")
            .style("font", "10px sans-serif")
            .attr("viewBox", [0.5, -30.5, width, height + 30])
            .attr("transform", "translate(0, 30)");
        invariant(hierarchy.children !== undefined, "No children was found");
        hierarchy.children.sort((a, b) => {
            invariant(b.value !== undefined, `${b.data.name}.value is undefined`);
            invariant(a.value !== undefined, `${a.data.name}.value is undefined`);
            return b.value - a.value;
        })

        const renderer = new TreeMapRenderer(svgTreeGroup, width, height, setPath, currentPath);
        const restorePath = (depth: number, node: d3.HierarchyRectangularNode<TreeMapNode>): d3.HierarchyRectangularNode<TreeMapNode> => {
            invariant(node.children, `${node.data.name}.children is undefined`);
            for (const child of node.children) {
                if (child.data.name == currentPath[depth]) {
                    return restorePath(depth + 1, child);
                }
            }
            return node;
        }
        console.log(restorePath(0, builtTreeMap));
        renderer.renderTreeMap(restorePath(0, builtTreeMap));

    }, [currentPath, builtTreeMap, tree, renderableNames, minimumRadius, height, width, primaryIrMap, secondaryIrMap, topCategory, hierarchy.children]);
    return <svg ref={svgRef}/>
}