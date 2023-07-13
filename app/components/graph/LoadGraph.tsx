import {useLayoutCircular} from "@react-sigma/layout-circular";
import {useLoadGraph} from "@react-sigma/core";
import {useEffect} from "react";
import {MultiDirectedGraph} from "graphology";
import type {SerializedEdge, SerializedNode} from "graphology-types";
import type {SigmaEdgeAttributes, SigmaNodeAttributes} from "~/components/graph/dataProcessing";
import invariant from "tiny-invariant";

interface LoadGraphProps {
    nodes: SerializedNode<SigmaNodeAttributes>[],
    edges: SerializedEdge<SigmaEdgeAttributes>[],
    namesToRender: string[]
}

export function LoadGraph({nodes, edges, namesToRender}: LoadGraphProps) {
    const {positions, assign} = useLayoutCircular();
    const loadGraph = useLoadGraph();
    useEffect(() => {
        const set = new Set(namesToRender);
        const graph = new MultiDirectedGraph();
        const filteredNodes = nodes.filter(x => set.has(x.key));
        
        graph.import({
            options: {
                type: "directed",
                multi: true,
                allowSelfLoops: true
            },
            nodes: filteredNodes,
            edges: edges.filter(x => set.has(x.source) && set.has(x.target))
        });
        loadGraph(graph);
        const allPositionAreZero = filteredNodes.every(({attributes}) => {
            invariant(attributes, "attributes is undefined");
            return attributes.x == 0 && attributes.y == 0;
        })
        if (allPositionAreZero) {
            assign();
        }
    }, [assign, positions, nodes, edges, loadGraph, namesToRender]);
    return null;
}