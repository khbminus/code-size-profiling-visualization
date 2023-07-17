import {getFilePath} from "~/models/utils";
import * as fs from "fs";

function isPathExists(...path: string[]): boolean {
    const finalPath = getFilePath(...path);
    return fs.existsSync(finalPath);
}


export const isLeftIrSizesExists = () => isPathExists("left-graph", "ir-sizes.json");
export const isLeftDceEdgesExists = () => isPathExists("left-graph", "dce-graph.json");
export const isRightIrSizesExists = () => isPathExists("right-graph", "ir-sizes.json");
export const isRightDceEdgesExists = () => isPathExists("right-graph", "dce-graph.json");

export const isDiffIrSizesExists = () => isPathExists("diff-graph", "ir-sizes.json");
export const isDiffDceGraphExists = () => isPathExists("diff-graph", "dce-graph.json");

export const isLeftGraphExists = () => isLeftDceEdgesExists() && isLeftIrSizesExists();
export const isRightGraphExists = () => isRightIrSizesExists() && isRightDceEdgesExists();
export const isDiffGraphExists = () => isDiffIrSizesExists() && isDiffDceGraphExists();

export const isLeftRetainedSizesExists = () => isPathExists("retained-graph-left", "retained-sizes.json");
export const isRightRetainedSizesExists = () => isPathExists("retained-graph-right", "retained-sizes.json");
export const isDiffRetainedSizesExists = () => isPathExists("retained-graph-diff", "retained-sizes.json");

export const isLeftIrMapExists = () => isLeftIrSizesExists() && isLeftRetainedSizesExists();
export const isRightIrMapExists = () => isRightIrSizesExists() && isRightRetainedSizesExists();
export const isDiffIrMapExists = () => isDiffIrSizesExists() && isDiffRetainedSizesExists()