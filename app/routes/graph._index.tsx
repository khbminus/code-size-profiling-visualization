import {json} from "@remix-run/node";
import {getRegularGraphLeft} from "~/models/graph.server";
import {useLoaderData} from "@remix-run/react";
import {SigmaContainer, useLoadGraph, useSigma} from "@react-sigma/core";
import {FC, useEffect} from "react";
import Graph, {MultiDirectedGraph} from "graphology";
import "@react-sigma/core/lib/react-sigma.min.css";
import {useWorkerLayoutForceAtlas2} from "@react-sigma/layout-forceatlas2";
import {useLayoutCircular} from "@react-sigma/layout-circular";
import {useWorkerLayoutNoverlap} from "@react-sigma/layout-noverlap";

export const loader = async () => {
    const {nodes, edges} = await getRegularGraphLeft();
    return json({nodes: [...nodes.entries()], edges: edges});
}

export function LoadGraph() {
    const {nodes, edges} = useLoaderData<typeof loader>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sigma = useSigma();
    const { positions, assign } = useLayoutCircular();
    const loadGraph = useLoadGraph();
    useEffect(() => {
        const graph = new MultiDirectedGraph();
        const processedNodes = nodes.map(([name, attrs]) => ({
            key: name,
            attributes: {
                x: 0,
                y: 0,
                label: name
            },
        }));
        const processedEdges = edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            attributes: {
                isTargetContagious: edge.isTargetContagious,
                label: edge.description,
            }
        }));
        graph.import({
            options: {
                type: "directed",
                multi: true,
                allowSelfLoops: true
            },
            nodes: processedNodes,
            edges: processedEdges
        });
        loadGraph(graph);
        console.log(`Loaded ${graph.nodes().length} nodes and ${graph.edges().length}`)
        assign();
    }, [assign, positions, nodes, edges, loadGraph]);
    return null;
}

export const ForceLayout: FC = () => {
    const { start, kill } = useWorkerLayoutForceAtlas2({ settings: { barnesHutOptimize: false}});

    useEffect(() => {
        start();
        return () => {
            kill();
        }
    }, [start, kill]);
    return <></>;
}

export default function GraphPage() {
    return (
        <SigmaContainer style={{height: "100vh", width: "100vw"}}
                        graph={MultiDirectedGraph}
                        settings={{renderEdgeLabels: true, defaultEdgeType: "arrow"}}
        >
            <LoadGraph/>
            <ForceLayout/>
        </SigmaContainer>
    )
}