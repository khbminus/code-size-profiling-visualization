import Palette from "iwanthue/palette";
import type {Attributes, SerializedEdge, SerializedNode} from "graphology-types";
import type {IrEntry} from "~/models/irMaps.server";
import type {Edge} from "~/models/graph.server";
import * as d3 from "d3";
import {palette} from "~/components/palette";

export interface SigmaNodeAttributes extends Attributes {
    x: number;
    y: number;
    label: string;
    color: string;
    size: number;
}

export interface SigmaEdgeAttributes extends Attributes {
    isTargetContagious: boolean;
    label: string;
}

export default function getSigmaGraph(nodes: [string, IrEntry][], edges: Edge[]):
    [SerializedNode<SigmaNodeAttributes>[], SerializedEdge<SigmaEdgeAttributes>[]] {

    const sizeScale = d3.scaleLinear()
        .domain([0, nodes.map(([_, {size}]) => size).reduce((a, b) => Math.max(a, b))])
        .range([5, 50]);
    const sigmaNodes = nodes
        .map(([name, attrs]) => ({
            key: name,
            attributes: {
                x: 0,
                y: 0,
                label: name,
                color: palette.get(attrs.type),
                size: sizeScale(attrs.size),
                realSize: attrs.size,
            },
        }));
    const sigmaEdges = edges
        .map(edge => ({
            source: edge.source,
            target: edge.target,
            attributes: {
                isTargetContagious: edge.isTargetContagious,
                label: edge.description,
            }
        }));
    return [sigmaNodes, sigmaEdges];
}