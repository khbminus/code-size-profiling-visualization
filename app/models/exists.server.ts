import {constructSourcePath, getFilePath} from "~/models/utils";
import * as fs from "fs";

function isPathExists(...path: string[]): boolean {
    const finalPath = getFilePath(...path);
    return fs.existsSync(finalPath);
}

function isSourceMapPathExists(...parts: string[]): boolean {
    const finalPath = constructSourcePath(...parts);
    return fs.existsSync(finalPath);
}


export const isLeftIrSizesExists = () => isPathExists("left-graph", "ir-sizes.json");
export const isLeftDceEdgesExists = () => isPathExists("left-graph", "dce-graph.json");
export const isRightIrSizesExists = () => isPathExists("right-graph", "ir-sizes.json");
export const isRightDceEdgesExists = () => isPathExists("right-graph", "dce-graph.json");

export const isDiffIrSizesExists = () => isPathExists("diff-graph", "ir-sizes.json");
export const isDiffDceGraphExists = () => isPathExists("diff-graph", "dce-graph.json");
export const isLeftRetainedSizesExists = () => isPathExists("retained-left", "retained-sizes.json");
export const isRightRetainedSizesExists = () => isPathExists("retained-right", "retained-sizes.json");
export const isDiffRetainedSizesExists = () => isPathExists("retained-diff", "retained-sizes.json");
export const isLeftGraphExists = () => isLeftDceEdgesExists() && isLeftIrSizesExists() && isLeftRetainedSizesExists();
export const isRightGraphExists = () => isRightIrSizesExists() && isRightDceEdgesExists() && isRightRetainedSizesExists();
export const isDiffGraphExists = () => isDiffIrSizesExists() && isDiffDceGraphExists();


export const isLeftIrMapExists = () => isLeftIrSizesExists() && isLeftRetainedSizesExists();
export const isRightIrMapExists = () => isRightIrSizesExists() && isRightRetainedSizesExists();
export const isDiffIrMapExists = () => isDiffIrSizesExists() && isDiffRetainedSizesExists()

const existsKotlinSourceMap = () => isSourceMapPathExists("kotlin.map");
const existsWatSourceMap = () => isSourceMapPathExists("wat.map");
const existsSegments = () => isSourceMapPathExists("segments.json");
export const isSourceMapExists = () => existsSegments() && existsWatSourceMap() && existsKotlinSourceMap()