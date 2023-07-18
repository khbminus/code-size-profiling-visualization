import type {IrEntry, IrMap} from "~/models/irMaps.server";
import {promises as fs} from "fs";
import {getIrMap} from "~/models/irMaps.server";
import {getFilePath} from "~/models/utils";

export type GraphData = {
    nodes: Map<string, IrEntry>,
    edges: Edge[],
    retainedNodes: IrMap | null
}

export type Edge = {
    source: string,
    target: string,
    description: string,
    isTargetContagious: boolean
}

export async function getGraph(graphPath: string, retainedPath?: string): Promise<GraphData> {
    const edgesPath = getFilePath(graphPath, "dce-graph.json");
    return Promise
        .all(
            [
                getIrMap(graphPath, "ir-sizes.json"),
                fs.readFile(edgesPath, 'utf-8').then(content => JSON.parse(content) as Edge[]),
                retainedPath !== undefined ? getIrMap(retainedPath, "retained-sizes.json") : Promise.resolve(null),
            ])
        .then(([nodes, edges, retainedNodes]) => {
            const nodesMap = new Map(Object.entries(nodes));
            edges.forEach(({source, target}) => {
                if (!nodesMap.has(source)) {
                    nodesMap.set(source, {size: 0, type: "unknown"});
                }
                if (!nodesMap.has(target)){
                    nodesMap.set(target, {size: 0, type: "unknown"});
                }
            })
            return {edges: edges, nodes: nodesMap, retainedNodes: retainedNodes};
        });
}

export const getRegularGraphLeft = () => getGraph("left-graph", "retained-left");
export const getRegularGraphRight = () => getGraph("right-graph", "retained-right");
export const getDiffGraph = () => getGraph("diff-graph");
