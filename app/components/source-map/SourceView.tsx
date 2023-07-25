import {Highlight, themes} from "prism-react-renderer";
import type {SourceMapSegment} from "~/models/sourceMap.server";
import {Queue} from "queue-typescript"
import type {SpanMetaHolder} from "~/components/source-map/child-function";
import buildChildFunction from "~/components/source-map/child-function";
import {useMemo} from "react";

export interface SourceViewProps {
    text: string,
    language: string,
    segments: SourceMapSegment[],
    palette: string[],
    metaHolder: Map<string, SpanMetaHolder>
}

export default function SourceView({text, language, segments, palette, metaHolder}: SourceViewProps) {
    const segmentsQueue = useMemo(() => {
        const copy = [...segments];
        copy.sort((a, b) => {
            if (a.startCursor.line == b.startCursor.line) {
                return a.startCursor.column - b.startCursor.column;
            }
            return a.startCursor.line - b.startCursor.line;
        })
        return new Queue(...copy);
    }, [segments]);
    return <Highlight
        code={text}
        language={language}
        theme={themes.github}
    >
        {buildChildFunction(segmentsQueue, palette, metaHolder)}
    </Highlight>
}