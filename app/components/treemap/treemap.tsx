import type {IrEntry} from "~/models/irMaps.server";
import type {TreeMapNodeCategory, TreeMapNode} from "~/components/treemap/processData";
import {buildHierarchy, removeAllSmall} from "~/components/treemap/processData";
import {useEffect, useMemo, useRef, useState} from "react";
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
    const tilingFunction = useMemo(() => ((node: d3.HierarchyRectangularNode<any>, x0: number, y0: number, x1: number, y1: number) => {
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
    }), [width, height]);
    const treemap = useMemo(() => d3
        .treemap<TreeMapNode>()
        .tile(tilingFunction), [tilingFunction]);
    const tree = useMemo(() =>
        buildHierarchy(renderableNames, "Kotlin IR", 0, topCategory, primaryIrMap, secondaryIrMap),
        [renderableNames, topCategory, primaryIrMap, secondaryIrMap]);

    const hierarchy = useMemo(() => removeAllSmall(
        d3
        .hierarchy(tree)
        .sum(d => d.value), minimumRadius), [minimumRadius,tree]);
    invariant(hierarchy, "hierarchy is empty");
    const builtTreeMap = useMemo(
        () => treemap(hierarchy),
        [treemap, hierarchy]
    );

    const [currentPath, setPath] = useState<string[]>([]);

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
        if (hierarchy.children === undefined) {
            return
        }
        hierarchy.children.sort((a, b) => {
            invariant(b.value !== undefined, `${b.data.name}.value is undefined`);
            invariant(a.value !== undefined, `${a.data.name}.value is undefined`);
            return b.value - a.value;
        });

        const renderer = new TreeMapRenderer(svgTreeGroup, width, height, setPath, currentPath);
        const restorePath = (depth: number, node: d3.HierarchyRectangularNode<TreeMapNode>): d3.HierarchyRectangularNode<TreeMapNode> => {
            if (depth == currentPath.length) {
                return node;
            }
            invariant(node.children, `${node.data.name}.children is undefined`);
            for (const child of node.children) {
                if (child.data.name == currentPath[depth]) {
                    return restorePath(depth + 1, child);
                }
            }
            return node;
        }
        renderer.renderTreeMap(restorePath(0, builtTreeMap));

    }, [builtTreeMap,height, width, hierarchy, hierarchy.children]);
    return <svg ref={svgRef}/>
}