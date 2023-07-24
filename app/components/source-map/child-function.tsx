import type {RenderProps, Token, TokenInputProps, LineInputProps, LineOutputProps} from "prism-react-renderer";
import type {ReactNode} from "react";
import LineNumber from "~/components/source-map/LineNumber";
import type {SourceMapSegment} from "~/models/sourceMap.server";
import {Queue} from "queue-typescript";
import type Palette from "iwanthue/palette";
const Color = require("color");

export default function buildChildFunction(queue: Queue<SourceMapSegment>, colors: Palette<number>) {
    return function childFunction({style, tokens, getTokenProps, getLineProps}: RenderProps) {
        const nextQueue = new Queue(...queue);
        return <pre style={style}>
        {
            tokens.map((line, i) =>
                buildLine(
                    line,
                    getLineProps,
                    getTokenProps,
                    <LineNumber maximumLength={tokens.length.toString().length} index={i}/>,
                    i,
                    nextQueue,
                    colors
                )
            )
        }
    </pre>
    }
}

function buildLine(
    tokens: Token[],
    getLineProps: (input: LineInputProps) => LineOutputProps,
    getTokenProps: (input: TokenInputProps) => LineOutputProps,
    lineNumber: ReactNode,
    index: number,
    segments: Queue<SourceMapSegment>,
    colors: Palette<number>,
): ReactNode {
    let columnIndex = 0;
    return <div key={index} {...getLineProps({line: tokens})}>
        {lineNumber}
        {tokens.map((token, key) => {
            const tokenNode = buildToken(token, getTokenProps, key, index, columnIndex, segments, colors);
            columnIndex += token.content.length;
            return tokenNode;
        })}
    </div>
}

function buildToken(
    token: Token,
    getTokenProps: (input: TokenInputProps) => LineOutputProps,
    key: number,
    line: number,
    column: number,
    segments: Queue<SourceMapSegment>,
    colors: Palette<number>,
): ReactNode {
    let color: string | null = null;
    while (segments.length && shouldBeRemoved(segments.front, line, column + token.content.length)) {
        if (segments.front.sourceStartFileLine < 100) {
            console.log("deque", token.content, line, column, segments.front)
        }
        segments.dequeue();
    }
    if (segments.front.sourceStartFileLine < 100) {
        console.log(token.content, segments.front, line, column);
    }
    if (segments.length && inSegment(segments.front, line, column)) {
        color = colors.get(segments.front.startOffsetGenerated);
    }
    return <span key={key} {...tokenPropsWrapper(getTokenProps, color)({token})}/>
}

function tokenPropsWrapper(fun: (input: TokenInputProps) => LineOutputProps, color: string | null) {
    return function (input: TokenInputProps) {
        const obj = fun(input);
        if (color !== null) {
            const opaqued = Color(color).opaquer(0.3).hex();
            if (obj.style !== undefined) {
                obj.style.backgroundColor = opaqued;
                // obj.style.borderRadius = 10;
            } else {
                obj.style = {backgroundColor: opaqued, /*borderRadius: 10*/};
            }
        }
        return obj;
    }
}

function shouldBeRemoved(seg: SourceMapSegment, line: number, column: number): boolean {
    return seg.sourceEndFileLine < line || (seg.sourceEndFileLine == line && seg.sourceEndLineColumn < column);
}

function inSegment(seg: SourceMapSegment, line: number, column: number): boolean {
    if (line < seg.sourceStartFileLine || line > seg.sourceEndFileLine) {
        return false;
    }
    if (line == seg.sourceEndFileLine) {
        return column < seg.sourceEndLineColumn;
    }
    if (line == seg.sourceStartFileLine) {
        return column >= seg.sourceStartLineColumn;
    }
    return true;
}