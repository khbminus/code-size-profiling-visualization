import type {RenderProps} from "prism-react-renderer";
import LineNumber from "~/components/source-map/LineNumber";
import type {SourceMapSegment} from "~/models/sourceMap.server";
import {Queue} from "queue-typescript";
import type {LineWrapper} from "~/components/source-map/process-tokens";
import {processLine} from "~/components/source-map/process-tokens";
import {useMemo, useRef} from "react";
import TokenComponent from "~/components/source-map/TokenComponent";

export type SpanMetaHolder = {
    onHoverStart: (() => void),
    onHoverEnd: (() => void)
};

export default function buildChildFunction(
    queuedSegments: Queue<SourceMapSegment>,
    colors: string[],
    metaHolder: Map<string, SpanMetaHolder>
) {
    return function ChildFunction({style, getTokenProps, tokens, getLineProps}: RenderProps) {
        const lines: LineWrapper[] = useMemo(() => {
            const clonedQueue = new Queue(...queuedSegments);
            return tokens
                .map(line => ({
                    attrs: getLineProps({line}),
                    tokens: line.map(token => ({
                        text: token.content,
                        attrs: getTokenProps({token}),
                        segmentInfo: null
                    }))
                }))
                .map((line, index) =>
                    processLine(clonedQueue, colors, index, line)
                )
        }, [tokens, getLineProps, getTokenProps]);
        const mapRef = useRef(metaHolder);

        return <pre style={style}>
            {lines.map((line, lineNumber) =>
                <div key={lineNumber} {...line.attrs}>
                    <LineNumber maximumLength={lines.length.toString().length} index={lineNumber}/>
                    {line.tokens.map((token, columnNumber) =>
                        <TokenComponent
                            segmentInfo={token.segmentInfo}
                            metaHolder={mapRef.current}
                            attrs={token.attrs}
                            key={columnNumber}
                        ></TokenComponent>
                    )}
                </div>
            )}
        </pre>
    }
}