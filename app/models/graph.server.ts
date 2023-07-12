import type {IrEntry, IrMap} from "~/models/irMaps.server";
import {promises as fs} from "fs";
import {getIrMap} from "~/models/irMaps.server";
import {getFilePath} from "~/models/utils";

export type Graph = {
    nodes: Map<string, IrEntry>,
    edges: Edge[]
}

export type Edge = {
    source: string,
    target: string,
    description: string,
    isTargetContagious: boolean
}

export async function getGraph(...directory: string[]): Promise<Graph> {
    const edgesPath = getFilePath(...directory);
    return Promise
        .all(
            [
                getIrMap(...directory),
                fs.readFile(edgesPath).then(content => JSON.parse(content))
            ])
        .then((nodes: IrMap, edges: Edge[]): Graph => ({edges: edges, nodes: nodes}));
}

export const getRegularGraphLeft = () => getGraph("left-graph");
