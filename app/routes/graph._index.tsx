import type { LinksFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import type {Edge} from "~/models/graph.server";
import {getRegularGraphLeft} from "~/models/graph.server";
import {useLoaderData} from "@remix-run/react";
import {SigmaContainer, useLoadGraph, useRegisterEvents, useSigma} from "@react-sigma/core";
import {useEffect, useState} from "react";
import {MultiDirectedGraph} from "graphology";
import "@react-sigma/core/lib/react-sigma.min.css";
import {useWorkerLayoutForceAtlas2} from "@react-sigma/layout-forceatlas2";
import {useLayoutCircular} from "@react-sigma/layout-circular";
import * as d3 from "d3";
import {processNames} from "~/components/tree-view/processData";
import type {IrEntry} from "~/models/irMaps.server";
import "react-checkbox-tree/lib/react-checkbox-tree.css"
import Palette from "iwanthue/palette";
import TreeView from "~/components/tree-view/TreeView";
import NodeFastProgram from "sigma/rendering/webgl/programs/node.fast"
import EdgeArrowProgram from "sigma/rendering/webgl/programs/edge.arrow";
import type {PlainObject} from "sigma/types";

export const loader = async () => {
    const {nodes, edges} = await getRegularGraphLeft();
    return json({nodes: [...nodes.entries()], edges: edges});
}

export const links: LinksFunction = () => [{
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
}, {
    rel: "stylesheet",
    href: "/style.css"
}
]

interface LoadGraphProps {
    nodes: [string, IrEntry][],
    edges: Edge[],
    namesToRender: string[]
}

export function LoadGraph(props: LoadGraphProps) {
    const {nodes, edges, namesToRender} = props;
    const {positions, assign} = useLayoutCircular();
    const loadGraph = useLoadGraph();
    const palette = Palette.generateFromValues("types",
        ["function", "property", "field", "anonymous initializer", "unknown", "class"], {colorSpace: 'pastel'});
    useEffect(() => {
        const set = new Set(namesToRender);
        const graph = new MultiDirectedGraph();
        const sizeScale = d3.scaleLinear()
            .domain([0, nodes.map(([_, {size}]) => size).reduce((a, b) => Math.max(a, b))])
            .range([5, 50]);
        const processedNodes = nodes
            .filter(([name, _]) => set.has(name))
            .map(([name, attrs]) => ({
                key: name,
                attributes: {
                    x: 0,
                    y: 0,
                    label: name,
                    color: palette.get(attrs.type),
                    size: sizeScale(attrs.size),
                },
            }));
        const processedEdges = edges
            .filter(({source, target}) => set.has(source) && set.has(target))
            .map(edge => ({
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
    }, [assign, positions, nodes, edges, loadGraph, namesToRender]);
    return null;
}

export function BetterHover({hoveredNode}: { hoveredNode: string | null }) {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const NODE_FADE_COLOR = "#bbb";
    const EDGE_FADE_COLOR = "#eee";

    const debouncedHoveredNode = useDebounce(hoveredNode, 40);

    useEffect(() => {
        sigma.setSetting("hoverRenderer", (context, data, settings) =>
            drawHover(context, {...sigma.getNodeDisplayData(data.key), ...data}, settings),
        );
    }, [sigma, graph]);

    useEffect(() => {
        const hoveredColor: string = debouncedHoveredNode ? sigma.getNodeDisplayData(debouncedHoveredNode)!.color : "";

        sigma.setSetting(
            "nodeReducer",
            debouncedHoveredNode
                ? (node, data) =>
                    node === debouncedHoveredNode ||
                    graph.hasEdge(node, debouncedHoveredNode) ||
                    graph.hasEdge(debouncedHoveredNode, node)
                        ? {...data, zIndex: 1}
                        : {...data, zIndex: 0, label: "", color: NODE_FADE_COLOR, image: null, highlighted: false}
                : null,
        );
        sigma.setSetting(
            "edgeReducer",
            debouncedHoveredNode
                ? (edge, data) =>
                    graph.hasExtremity(edge, debouncedHoveredNode)
                        ? {...data, color: hoveredColor, size: 4}
                        : {...data, color: EDGE_FADE_COLOR, hidden: true}
                : null,
        );
    }, [debouncedHoveredNode]);
    return <></>;
}

export function GraphEventController({setHovered}: { setHovered: (newHovered: string | null) => void }) {
    const registerEvents = useRegisterEvents();
    useEffect(() => {
        registerEvents({
            enterNode({node}) {
                setHovered(node);
            },
            leaveNode() {
                setHovered(null);
            }
        })
    }, [registerEvents]);
    return <></>;
}

export function ForceLayout() {
    const sigma = useSigma();
    const {start, kill} = useWorkerLayoutForceAtlas2({
        settings: {
            barnesHutOptimize: sigma.getGraph().order > 10000,
            slowDown: 20
        }
    });
    useEffect(() => {
        start();
        return () => {
            kill();
        }
    }, [start, kill]);
    return <></>;
}

export default function GraphPage() {
    const {nodes, edges} = useLoaderData<typeof loader>();
    const [checked, setChecked] = useState(() =>
        nodes.map(([name, _]) => name));
    const [treeViewNodes] = useState(() =>
        processNames(nodes.map(([name, _]) => name)))
    const [expanded, setExpanded] = useState<string[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    return (
        <div id="content">
            <SigmaContainer style={{height: "100vh", width: "80%"}}
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
                <LoadGraph nodes={nodes} edges={edges} namesToRender={checked}/>
                <ForceLayout/>
                <GraphEventController setHovered={setHoveredNode}/>
                <BetterHover hoveredNode={hoveredNode}/>
            </SigmaContainer>
            <TreeView checked={checked} expanded={expanded} setCheck={setChecked} setExpanded={setExpanded}
                      nodes={treeViewNodes}/>
        </div>
    )
}

function drawHover(context: CanvasRenderingContext2D, data: PlainObject, settings: PlainObject) {
    const size = settings.labelSize;
    const font = settings.labelFont;
    const weight = settings.labelWeight;

    const label = data.label;
    const TEXT_COLOR = "#000000";

    // Then we draw the label background
    context.beginPath();
    context.fillStyle = "#fff";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 2;
    context.shadowBlur = 8;
    context.shadowColor = "#000";

    context.font = `${weight} ${size}px ${font}`;
    const labelWidth = context.measureText(label).width;


    const x = Math.round(data.x);
    const y = Math.round(data.y);
    const w = Math.round(labelWidth + size / 2 + data.size + 3);
    const hLabel = Math.round(size / 2 + 4);

    drawRoundRect(context, x, y - 12, w, hLabel + 12, 5);
    context.closePath();
    context.fill();

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    // And finally we draw the labels
    context.fillStyle = TEXT_COLOR;
    context.font = `${weight} ${size}px ${font}`;
    context.fillText(label, data.x + data.size + 3, data.y + size / 3);


    context.fillStyle = data.color;
}

function drawRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function useDebounce<T>(value: T, delay: number): T {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(
        () => {
            const handler = setTimeout(() => {
                if (value !== debouncedValue) setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay],
    );

    return debouncedValue;
}
