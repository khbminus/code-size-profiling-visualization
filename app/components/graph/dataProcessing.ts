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
    realSize: number;
    retainedSize: number;
    shallowSize: number;
    realRetainedSize: number;
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
    const domainSet = nodes.map(([_, {size}]) => size)
    const retainedDomainSet = retainedNodes === null
        ? null
        : [...retainedNodes.values()].map(({size}) => size);

    const sizeScale = d3.scaleLinear()
        .domain([0, domainSet.reduce((a, b) => Math.max(a, b))])
        .range([5, 150]);

    const retainedSizeScale = retainedDomainSet == null ? sizeScale : d3.scaleLinear()
        .domain([0, retainedDomainSet.reduce((a, b) => Math.max(a, b))])
        .range([5, 150]);

    const sigmaNodes = nodes
        .map(([name, attrs]) => {
            return {
                key: name,
                attributes: {
                    x: 0,
                    y: 0,
                    label: attrs.displayName !== undefined ? attrs.displayName : name,
                    color: palette.get(attrs.type),
                    size: retainedSizeScale(retainedNodes?.get(name)?.size || attrs.size),
                    realSize: attrs.size,
                    realRetainedSize: retainedNodes?.get(name)?.size || attrs.size,
                    shallowSize: retainedSizeScale(attrs.size),
                    retainedSize: retainedSizeScale(retainedNodes?.get(name)?.size || attrs.size)
                },
            }
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