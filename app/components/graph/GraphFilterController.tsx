import {useSigma} from "@react-sigma/core";
import {useEffect, useMemo} from "react";
import {bfsFromNode} from "graphology-traversal";

interface GraphFilterControllerProps {
    nameToRender: string[],
    maximumDepth: number,
    allowedNames: string[]
}

export default function GraphFilterController({nameToRender, maximumDepth, allowedNames}: GraphFilterControllerProps) {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const allowedNameSet = useMemo(() => new Set(allowedNames), [allowedNames]);
    useEffect(() => {
            const visited = new Set<string>();
            nameToRender.forEach(nodeName => {
                bfsFromNode(graph, nodeName, (visitedNode, attr, depth) => {
                    if (visited.has(visitedNode) || !allowedNameSet.has(visitedNode)) {
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
        [allowedNameSet, nameToRender, graph, maximumDepth, allowedNames]
    );
    return <></>;
}