import type {IrEntry} from "~/models/irMaps.server";
import {promises as fs} from "fs";
import {getIrMap} from "~/models/irMaps.server";
import {getFilePath} from "~/models/utils";

export type GraphData = {
    nodes: Map<string, IrEntry>,
    edges: Edge[]
}

export type Edge = {
    source: string,
    target: string,
    description: string,
    isTargetContagious: boolean
}

export async function getGraph(...directory: string[]): Promise<GraphData> {
    const edgesPath = getFilePath(...directory, "dce-graph.json");
    return Promise
        .all(
            [
                getIrMap(...directory, "ir-sizes.json"),
                fs.readFile(edgesPath, 'utf-8').then(content => JSON.parse(content) as Edge[])
            ])
        .then(([nodes, edges]) => {
            const nodesMap = new Map(Object.entries(nodes));
            edges.forEach(({source, target}) => {
                if (!nodesMap.has(source)) {
                    nodesMap.set(source, {size: 0, type: "unknown"});
                }
                if (!nodesMap.has(target)){
                    nodesMap.set(target, {size: 0, type: "unknown"});
                }
            })
            return {edges: edges, nodes: nodesMap};
        });
}

export const getRegularGraphLeft = () => getGraph("left-graph");
export const getRegularGraphRight = () => getGraph("right-graph");
export const getDiffGraph = () => getGraph("diff-graph");
