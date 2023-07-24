import {Highlight, themes} from "prism-react-renderer";
import type {SourceMapSegment} from "~/models/sourceMap.server";
import {Queue} from "queue-typescript"
import buildChildFunction from "~/components/source-map/child-function";
import {useMemo} from "react";
import Palette from "iwanthue/palette";

export interface SourceViewProps {
    text: string,
    language: string,
    segments: SourceMapSegment[],
    palette: Palette<number>
}

export default function SourceView({text, language, segments, palette}: SourceViewProps) {
    const segmentsQueue = useMemo(() => {
        const copy = [...segments];
        copy.sort((a, b) => {
            if (a.sourceStartFileLine == b.sourceStartFileLine) {
                return a.sourceStartLineColumn - b.sourceStartLineColumn;
            }
            return a.sourceStartFileLine - b.sourceStartFileLine;
        })
        return new Queue(...copy);
    }, [segments]);
    return <Highlight
        code={text}
        language={language}
        theme={themes.github}
    >
        {buildChildFunction(segmentsQueue, palette)}
    </Highlight>
}