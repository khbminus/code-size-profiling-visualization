import {promises as fs} from "fs";
import process from "process";
import path from "path";

export type SourceMapSegment = {
    sourceFileIndex: number,
    sourceStartFileLine: number,
    sourceStartLineColumn: number,
    sourceEndFileLine: number,
    sourceEndLineColumn: number,
    startOffsetGenerated: number
}

export type SourceMapMatch = {
    kotlinSegment: SourceMapSegment,
    watSegment: SourceMapSegment
}

export async function loadKotlinSourceCode(): Promise<string> {
    return Promise.resolve(`import kotlinx.browser.document
import kotlinx.dom.appendText

fun main() {
    document.body?.appendText(getConstText())
    document.body?.appendText("\\n")
    document.body?.appendText(getText1("stringLiteralFromMain"))
    document.body?.appendText("\\n")
    document.body?.appendText(getText1(getConstText()))
    document.body?.appendText("\\n")
    document.body?.appendText(getText2())
}

fun getText1(x: String): String {
    val y = x.take(3)
    return "getText1: $y"
}

fun getConstText() = "constTextFunc"
fun getText2(): String = ('A'..'Z').joinToString()`);
}

export async function loadWasmSourceCode(): Promise<string> {
    return fs
        .readFile(path.join(process.cwd(), "source-maps", "source.wat"), "utf-8")
}

export async function loadSegments(): Promise<SourceMapMatch[]> {
    return fs
        .readFile(path.join(process.cwd(), "source-maps", "segments.json"), "utf-8")
        .then(x => JSON.parse(x));
}