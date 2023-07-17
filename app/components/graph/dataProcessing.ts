import Palette from "iwanthue/palette";
import type {Attributes, SerializedEdge, SerializedNode} from "graphology-types";
import type {IrEntry} from "~/models/irMaps.server";
import type {Edge} from "~/models/graph.server";
import * as d3 from "d3";
import {palette} from "~/components/palette";
import {useMemo} from "react";
import invariant from "tiny-invariant";

export interface SigmaNodeAttributes extends Attributes {
    x: number;
    y: number;
    label: string;
    color: string;
    size: number;
    realSize: number;
    retainedSize: number;
}

export interface SigmaEdgeAttributes extends Attributes {
    isTargetContagious: boolean;
    label: string;
}

export default function getSigmaGraph(
    nodes: [string, IrEntry][],
    retainedNodes: Map<string, IrEntry> | null,
    edges: Edge[]
): [SerializedNode<SigmaNodeAttributes>[], SerializedEdge<SigmaEdgeAttributes>[]] {
    const domainSet = nodes.map(([_, {size}]) => size);

    const sizeScale = d3.scaleLinear()
        .domain([0, domainSet.reduce((a, b) => Math.max(a, b))])
        .range([5, 150]);

    const sigmaNodes = nodes
        .map(([name, attrs]) => {
            const node = {
                key: name,
                attributes: {
                    x: 0,
                    y: 0,
                    label: name,
                    color: palette.get(attrs.type),
                    size: sizeScale(attrs.size),
                    realSize: attrs.size,
                    retainedSize: retainedNodes?.get(name)?.size || 0
                },
            };
            return node
        });
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