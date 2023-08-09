import {promises as fs} from "fs";
import * as fsSync from "fs";
import path from "path";
import {constructSourcePath} from "~/models/utils";

export type FileCursor = {
    line: number,
    column: number
}

export type SourceMapSegment = {
    startOffsetGenerated: number,
    endOffsetGenerated: number,
    sourceFileIndex: number,
    startCursor: FileCursor,
    endCursor: FileCursor,
    id: number,
    type: "wasm" | "kotlin"
}
export type SourceMapMatch = {
    watSegment: SourceMapSegment,
    kotlinSegment: SourceMapSegment
}

export type SourceMap = {
    version: number,
    sources: string[],
    sourcesContent: (string | null)[]
}

export type SourceFiles = {
    files: string[],
    fileContents: (string | null)[],
}

export type FunctionPosition = { lineNumber: number, columnNumber: number }

export type FunctionPositions = {
    [key: string]: FunctionPosition
}


export async function getFiles(...sourceMapPath: string[]): Promise<SourceFiles> {
    return loadSourceMap(...sourceMapPath)
        .then(({sources, sourcesContent}) => {
            return Promise.all(sourcesContent.map((value, index) => {
                if (value !== null) {
                    return Promise.resolve(value)
                } else if (fsSync.existsSync(sources[index])) {
                    try {
                        fsSync.accessSync(sources[index], fsSync.constants.R_OK);
                        return fs.readFile(sources[index], "utf-8");
                    } catch (e) {
                        return Promise.resolve(null);
                    }
                }
                return Promise.resolve(null);
            }))
                .then(readContent => ({files: sources.map(x => path.basename(x)), fileContents: readContent}));
        });
}

export async function loadSourceMap(...path: string[]): Promise<SourceMap> {
    return fs
        .readFile(constructSourcePath(...path), "utf-8")
        .then(x => JSON.parse(x));
}

export async function loadSegments(): Promise<SourceMapMatch[]> {
    return fs
        .readFile(constructSourcePath("segments.json"), "utf-8")
        .then(x => JSON.parse(x))
        .then((segments: SourceMapMatch[]) => {
            segments.forEach((value, i) => {
                value.watSegment.id = i;
                value.watSegment.type = "wasm";
                value.kotlinSegment.id = i;
                value.kotlinSegment.type = "kotlin";
            });
            return segments;
        })
}

export async function loadFunctionPositions(): Promise<FunctionPositions> {
    return fs
        .readFile(constructSourcePath("functions-wat.json"), "utf-8")
        .then(x => JSON.parse(x));
}

export const getKotlinFiles = () => getFiles("kotlin.map");
export const getWatFiles = () => getFiles("wat.map");