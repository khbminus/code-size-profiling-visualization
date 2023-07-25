import type {LineOutputProps, TokenOutputProps} from "prism-react-renderer";
import type {SourceMapSegment} from "~/models/sourceMap.server";
import type {Queue} from "queue-typescript";

export type SegmentInfo = {
    id: number,
    language: "kotlin" | "wasm"
}

export type TokenWrapper = {
    text: string,
    segmentInfo: SegmentInfo | null,
    attrs: TokenOutputProps
};

export type LineWrapper = {
    tokens: TokenWrapper[],
    attrs: LineOutputProps
}


export function processLine(queuedSegments: Queue<SourceMapSegment>, colors: string[], lineNumber: number, tokens: LineWrapper): LineWrapper {
    let currentColumn = 0;
    const nextTokens: TokenWrapper[] = [];
    tokens.tokens.forEach(token => {
        nextTokens.push(...processToken(queuedSegments, colors, lineNumber, currentColumn, token));
        currentColumn += token.text.length;
    });
    return {tokens: nextTokens, attrs: tokens.attrs};
}

function processToken(queuedSegments: Queue<SourceMapSegment>, colors: string[], lineNumber: number, columnNumber: number, token: TokenWrapper): TokenWrapper[] {
    while (queuedSegments.length && isFullyOutdated(queuedSegments.front, lineNumber, columnNumber)) {
        queuedSegments.dequeue();
    }
    if (!queuedSegments.length) {
        return [token];
    }
    const segment = queuedSegments.front;

    const currentMinimumSegmentColumn = (lineNumber === segment.startCursor.line ? segment.startCursor.column : 0);
    const currentMaximumSegmentColumn = (lineNumber === segment.endCursor.line
        ? segment.endCursor.column
        : (lineNumber < segment.startCursor.line ? 0 : Number.MAX_SAFE_INTEGER));
    const intersection: [number, number] = [
        Math.max(columnNumber, currentMinimumSegmentColumn),
        Math.min(columnNumber + token.text.length, currentMaximumSegmentColumn)
    ];
    if (intersection[0] >= intersection[1]) {
        return [token];
    }
    const leftPart: TokenWrapper = {
        text: token.text.slice(0, intersection[0] - columnNumber),
        attrs: structuredClone(token.attrs),
        segmentInfo: null
    };
    leftPart.attrs.children = leftPart.text.slice();

    const middlePart: TokenWrapper = {
        text: token.text.slice(intersection[0] - columnNumber, intersection[1] - columnNumber),
        attrs: structuredClone(token.attrs),
        segmentInfo: {id: segment.id, language: segment.type}
    };
    middlePart.attrs.children = middlePart.text.slice();
    if (middlePart.attrs.style === undefined) {
        middlePart.attrs.style = {backgroundColor: colors[segment.id]};
    } else {
        middlePart.attrs.style.background = colors[segment.id];
    }

    const rightPart: TokenWrapper = {
        text: token.text.slice(intersection[1] - columnNumber),
        attrs: structuredClone(token.attrs),
        segmentInfo: null
    };
    rightPart.attrs.children = rightPart.text.slice();

    const res: TokenWrapper[] = [];
    let newColumn = columnNumber;
    const notEmpty = [leftPart, middlePart, rightPart].filter(x => x.text.length)
    if (notEmpty.length == 1) {
        return notEmpty
    }
    if (leftPart.text.length) {
        res.push(...processToken(queuedSegments, colors, lineNumber, newColumn, leftPart));
        newColumn += leftPart.text.length;
    }
    if (middlePart.text.length) {
        res.push(...processToken(queuedSegments, colors, lineNumber, newColumn, middlePart));
        newColumn += middlePart.text.length;
    }
    if (rightPart.text.length) {
        res.push(...processToken(queuedSegments, colors, lineNumber, newColumn, rightPart));
    }
    return res;
}

function isFullyOutdated(segment: SourceMapSegment, line: number, column: number): boolean {
    return segment.endCursor.line < line || (segment.endCursor.line === line && segment.endCursor.column <= column);
}