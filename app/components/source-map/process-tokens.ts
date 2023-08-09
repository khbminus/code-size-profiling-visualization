import type {LineOutputProps, TokenOutputProps} from "prism-react-renderer";
import type {FunctionPosition, SourceMapSegment} from "~/models/sourceMap.server";
import type {Queue} from "queue-typescript";

export type SegmentInfo = {
    id: number,
    language: "kotlin" | "wasm"
}

export type TokenWrapper = {
    text: string,
    segmentInfo: SegmentInfo | null,
    attrs: TokenOutputProps,
    scrollToInitial: boolean
};

export type LineWrapper = {
    tokens: TokenWrapper[],
    attrs: LineOutputProps
}


export function processLine(queuedSegments: Queue<SourceMapSegment>, colors: string[], lineNumber: number, tokens: LineWrapper, scrollToCursor: FunctionPosition | null): LineWrapper {
    let currentColumn = 0;
    const nextTokens: TokenWrapper[] = [];
    tokens.tokens.forEach(token => {
        nextTokens.push(...processToken(queuedSegments, colors, lineNumber, currentColumn, token, scrollToCursor));
        currentColumn += token.text.length;
    });
    return {tokens: nextTokens, attrs: tokens.attrs};
}

function processToken(queuedSegments: Queue<SourceMapSegment>, colors: string[], lineNumber: number, columnNumber: number, token: TokenWrapper, scrollToCursor: FunctionPosition | null): TokenWrapper[] {
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
        setScroll(scrollToCursor, lineNumber, columnNumber, token);
        return [token];
    }
    const leftPart: TokenWrapper = {
        text: token.text.slice(0, intersection[0] - columnNumber),
        attrs: structuredClone(token.attrs),
        segmentInfo: null,
        scrollToInitial: false
    };
    leftPart.attrs.children = leftPart.text.slice();

    const middlePart: TokenWrapper = {
        text: token.text.slice(intersection[0] - columnNumber, intersection[1] - columnNumber),
        attrs: structuredClone(token.attrs),
        segmentInfo: {id: segment.id, language: segment.type},
        scrollToInitial: false
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
        segmentInfo: null,
        scrollToInitial: false
    };
    rightPart.attrs.children = rightPart.text.slice();

    const res: TokenWrapper[] = [];
    let newColumn = columnNumber;
    const notEmpty = [leftPart, middlePart, rightPart].filter(x => x.text.length)
    if (notEmpty.length == 1) {
        setScroll(scrollToCursor, lineNumber, columnNumber, notEmpty[0]);
        return notEmpty
    }

    if (leftPart.text.length) {
        res.push(...processToken(queuedSegments, colors, lineNumber, newColumn, leftPart, scrollToCursor));
        newColumn += leftPart.text.length;
    }
    if (middlePart.text.length) {
        res.push(...processToken(queuedSegments, colors, lineNumber, newColumn, middlePart, scrollToCursor));
        newColumn += middlePart.text.length;
    }
    if (rightPart.text.length) {
        res.push(...processToken(queuedSegments, colors, lineNumber, newColumn, rightPart, scrollToCursor));
    }
    return res;
}

function isFullyOutdated(segment: SourceMapSegment, line: number, column: number): boolean {
    return segment.endCursor.line < line || (segment.endCursor.line === line && segment.endCursor.column <= column);
}

function setScroll(cursor: FunctionPosition | null, lineNumber: number, startColumn: number, token: TokenWrapper) {
    if (cursor === null) {
        return;
    }
    if (lineNumber != cursor.lineNumber || startColumn != 0) {
        return;
    }
    token.scrollToInitial = true;
}