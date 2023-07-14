import {MultiDirectedGraph} from "graphology";
import NodeFastProgram from "sigma/rendering/webgl/programs/node.fast";
import EdgeArrowProgram from "sigma/rendering/webgl/programs/edge.arrow";
import {SigmaContainer} from "@react-sigma/core";
import {LoadGraph} from "~/components/graph/LoadGraph";
import ForceLayout from "~/components/graph/ForceLayout";
import GraphEventController from "~/components/graph/GraphEventController";
import {GraphHoverComponent} from "~/components/graph/GraphHoverComponent";
import type {IrEntry} from "~/models/irMaps.server";
import type {Edge} from "~/models/graph.server";
import getSigmaGraph from "~/components/graph/dataProcessing";
import {useRef, useState} from "react";
import GraphFilterController from "~/components/graph/GraphFilterController";

export interface GraphProps {
    nodes: [string, IrEntry][],
    edges: Edge[],
    renderNames: string[],
    maxDepth: number
}

export default function Graph({nodes, edges, renderNames, maxDepth}: GraphProps) {
    const sigmaGraph = useRef(getSigmaGraph(nodes, edges));
    const [sigmaNodes, sigmaEdges] = sigmaGraph.current;
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    return <SigmaContainer style={{height: "100vh", width: "80%"}}
                           graph={MultiDirectedGraph}
                           settings={{
                               renderEdgeLabels: true,
                               defaultEdgeType: "arrow",
                               labelDensity: 0.1,
                               nodeProgramClasses: {
                                   "fast": NodeFastProgram
                               },
                               defaultNodeType: "fast",
                               edgeProgramClasses: {
                                   "arrow": EdgeArrowProgram
                               }
                           }}
    >
        <LoadGraph nodes={sigmaNodes} edges={sigmaEdges}/>
        <ForceLayout/>
        <GraphFilterController nameToRender={renderNames} maximumDepth={maxDepth}/>
        <GraphEventController setHovered={setHoveredNode}/>
        <GraphHoverComponent hoveredNode={hoveredNode}/>
    </SigmaContainer>
}