import type {RenderProps, Token, TokenInputProps, LineInputProps, LineOutputProps} from "prism-react-renderer";
import type {ReactNode} from "react";
import LineNumber from "~/components/source-map/LineNumber";
import type {SourceMapSegment} from "~/models/sourceMap.server";
import {Queue} from "queue-typescript";
import type Palette from "iwanthue/palette";
import {useRef} from "react";
import invariant from "tiny-invariant";

const Color = require("color");

export type SpanMetaHolder = {
    onHoverStart: (() => void),
    onHoverEnd: (() => void)
};

export default function buildChildFunction(queue: Queue<SourceMapSegment>, colors: Palette<number>, metaHolder: Map<string, SpanMetaHolder>) {
    return function childFunction({style, tokens, getTokenProps, getLineProps}: RenderProps) {
        const nextQueue = new Queue(...queue);
        return <pre style={style}>
        {
            tokens.map((line, i) =>
                <LineComponent
                    tokens={line}
                    getTokenProps={getTokenProps}
                    getLineProps={getLineProps}
                    lineNumber={<LineNumber maximumLength={tokens.length.toString().length} index={i}/>}
                    index={i}
                    segments={nextQueue}
                    colors={colors}
                    key={i}
                    metaHolder={metaHolder}
                />
            )
        }
    </pre>
    }
}

interface LineComponentProps {
    tokens: Token[],
    getLineProps: (input: LineInputProps) => LineOutputProps,
    getTokenProps: (input: TokenInputProps) => LineOutputProps,
    lineNumber: ReactNode,
    index: number,
    segments: Queue<SourceMapSegment>,
    colors: Palette<number>,
    metaHolder: Map<string, SpanMetaHolder>
}

export function LineComponent({tokens, getLineProps, getTokenProps, lineNumber, index, segments, colors, metaHolder}: LineComponentProps) {
    let columnIndex = 0;
    return <div key={index} {...getLineProps({line: tokens})}>
        {lineNumber}
        {tokens.map((token, key) => {
            const tokenNode = <TokenComponent
                token={token}
                key={key}
                nextKey={key}
                colors={colors}
                segments={segments}
                getTokenProps={getTokenProps}
                line={index}
                column={columnIndex}
                metaHolder={metaHolder}
            />;
            columnIndex += token.content.length;
            return tokenNode;
        })}
    </div>
}

interface TokenProps {
    token: Token,
    getTokenProps: (input: TokenInputProps) => LineOutputProps,
    nextKey: number,
    line: number,
    column: number,
    segments: Queue<SourceMapSegment>,
    colors: Palette<number>,
    metaHolder: Map<string, SpanMetaHolder>
}

export function TokenComponent(
    {token, getTokenProps, colors, column, nextKey, line, segments, metaHolder}: TokenProps
) {
    let color: string | null = null;
    const ref = useRef<HTMLSpanElement | null>(null);

    const onHoverStart = () => {
        const current = ref.current;
        if (current !== null) {
            current.style.borderWidth = "1px";
            current.style.borderColor = "black";
            if (window !== undefined) {
                current.scrollIntoView({behavior: "smooth"});
            }
        }
    };
    const onHoverEnd = () => {
        const current = ref.current;
        if (current !== null) {
            current.style.borderWidth = "0";
        }
    };
    let key: string | null = null;

    while (segments.length && shouldBeRemoved(segments.front, line, column + token.content.length)) {
        segments.dequeue();
    }
    if (segments.length && inSegment(segments.front, line, column)) {
        color = colors.get(segments.front.startOffsetGenerated);
        metaHolder.set(JSON.stringify({id: segments.front.id, type: segments.front.type}), {onHoverStart, onHoverEnd});
        key = JSON.stringify({id: segments.front.id, type: segments.front.type == "kotlin" ? "wasm" : "kotlin"});
    }
    const onMouseEnter = key === null ? () => {
    } : () => {
        invariant(key !== null);
        onHoverStart();
        metaHolder.get(key)?.onHoverStart();
    }
    const onMouseExit = key === null ? () => {
    } : () => {
        invariant(key !== null);
        metaHolder.get(key)?.onHoverEnd();
        onHoverEnd();
    }
    return <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseExit} key={nextKey}
                 ref={ref} {...tokenPropsWrapper(getTokenProps, color)({token})}/>
}

function tokenPropsWrapper(fun: (input: TokenInputProps) => LineOutputProps, color: string | null) {
    return function (input: TokenInputProps) {
        const obj = fun(input);
        if (color !== null) {
            const opaqued = Color(color).hex();
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