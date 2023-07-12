import {promises as fs} from "fs";
import * as path from "path";
import * as process from "process";

export type IrEntry = {
    size: number,
    type: "function" | "property" | "field" | "anonymous initializer" | "unknown"
}

export type IrMap = {
    [key: string]: IrEntry
}

async function getIrMap(...mapPath: string[]): Promise<IrMap> {
    const filePath = path.join(process.cwd(), "profile-data", ...mapPath);
    return fs
        .readFile(filePath, 'utf-8')
        .then(content => JSON.parse(content))
        .then(x => {
            console.log(x);
            return x;
        })
        .catch(x => {
            console.log(x);
        })
}

export const getShallowIrMapLeft = async () => getIrMap("ir-sizes-left.json");
export const getShallowIrMapRight = async () => getIrMap("ir-sizes-right.json");
export const getRetainedIrMapLeft = async () => getIrMap("retained-left", "retained-sizes.json");
export const RetainedIrMapRight = async () => getIrMap("retained-right", "retained-sizes.json");