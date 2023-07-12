import type {IrEntry} from "~/models/irMaps.server";
import type {TreeMapNodeCategory} from "~/components/treemap/processData";
import {buildHierarchy, removeAllSmall} from "~/components/treemap/processData";
import {useEffect, useRef} from "react";
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
    useEffect(() => {

        const tree = removeAllSmall(
            buildHierarchy(renderableNames, "Kotlin IR", 0, topCategory, primaryIrMap, secondaryIrMap),
            minimumRadius
        );
        if (typeof tree === "number") {
            return;
        }

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
        const hierarchy = d3
            .hierarchy(tree)
            .sum(d => d.value);
        invariant(hierarchy.children !== undefined, "No children was found");
        hierarchy.children.sort((a, b) => {
            invariant(b.value !== undefined, `${b.data.name}.value is undefined`);
            invariant(a.value !== undefined, `${a.data.name}.value is undefined`);
            return b.value - a.value;
        })

        const renderer = new TreeMapRenderer(hierarchy, svgTreeGroup, width, height);
        renderer.renderTreeMap();
    }, [renderableNames, minimumRadius, height, width, primaryIrMap, secondaryIrMap, topCategory]);
    return <svg ref={svgRef}/>
}