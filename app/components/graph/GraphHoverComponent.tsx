import {useSigma} from "@react-sigma/core";
import {useEffect} from "react";
import {useDebounce} from "~/utils";
import drawHover from "sigma/rendering/canvas/hover";

export function GraphHoverComponent({hoveredNode}: { hoveredNode: string | null }) {
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