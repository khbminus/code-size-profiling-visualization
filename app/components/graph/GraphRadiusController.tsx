import {useSigma} from "@react-sigma/core";
import {useEffect, useMemo} from "react";
import type {IrEntry} from "~/models/irMaps.server";
import * as d3 from "d3";

interface GraphRadiusControllerProps {
    showRetainedSizes: boolean,
    nodes: [string, IrEntry][],
    retainedNodes: Map<string, IrEntry> | null
}

export default function GraphRadiusController({showRetainedSizes, nodes, retainedNodes}: GraphRadiusControllerProps) {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const nodeRange = [5, 150];
    const nodesScale = useMemo(() => d3
            .scaleLinear([
                0,
                nodes.map(([_, {size}]) => size).reduce((a, b) => Math.max(a, b))
            ])
            .range(nodeRange)
        , [nodes]);
    const retainedScale = useMemo(() => retainedNodes == null ? null : d3
        .scaleLinear()
        .domain([
            0,
            [...retainedNodes.values()].map(( {size}) => size).reduce((a, b) => Math.max(a, b))
            ])
        .range(nodeRange),
    [retainedNodes]);
    useEffect(() => {
        graph.forEachNode((name, attrs) => {
            graph.updateNodeAttribute(name, "size", () => showRetainedSizes && retainedScale !== null
                ? retainedScale(attrs.retainedSize)
                : nodesScale(attrs.realSize));
        })
    }, [graph, nodesScale, retainedScale, showRetainedSizes, sigma]);
    return <></>;
}