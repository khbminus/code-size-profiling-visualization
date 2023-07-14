import {useSigma} from "@react-sigma/core";
import {useEffect} from "react";
import {bfsFromNode} from "graphology-traversal";

interface GraphFilterControllerProps {
    nameToRender: string[],
    maximumDepth: number
}

export default function GraphFilterController({nameToRender, maximumDepth}: GraphFilterControllerProps) {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    useEffect(() => {
            const visited = new Set<string>();
            nameToRender.forEach(nodeName => {
                bfsFromNode(graph, nodeName, (visitedNode, attr, depth) => {
                    if (visited.has(visitedNode)) {
                        return true;
                    }
                    visited.add(visitedNode);
                    return depth + 1 >= maximumDepth;
                })
            })
            graph.forEachNode((node) => {
                graph.setNodeAttribute(node, "hidden", !visited.has(node));
            })
        },
        [nameToRender, graph, maximumDepth]
    );
    return <></>;
}