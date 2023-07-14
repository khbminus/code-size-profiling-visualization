import {useLayoutCircular} from "@react-sigma/layout-circular";
import {useLoadGraph} from "@react-sigma/core";
import {useEffect} from "react";
import {MultiDirectedGraph} from "graphology";
import type {SerializedEdge, SerializedNode} from "graphology-types";
import type {SigmaEdgeAttributes, SigmaNodeAttributes} from "~/components/graph/dataProcessing";
import invariant from "tiny-invariant";

interface LoadGraphProps {
    nodes: SerializedNode<SigmaNodeAttributes>[],
    edges: SerializedEdge<SigmaEdgeAttributes>[]
}

export function LoadGraph({nodes, edges}: LoadGraphProps) {
    const {positions, assign} = useLayoutCircular();
    const loadGraph = useLoadGraph();
    useEffect(() => {
        const graph = new MultiDirectedGraph();
        
        graph.import({
            options: {
                type: "directed",
                multi: true,
                allowSelfLoops: true
            },
            nodes: nodes,
            edges: edges
        });
        loadGraph(graph);
        assign();
    }, [assign, positions, nodes, edges, loadGraph]);
    return null;
}