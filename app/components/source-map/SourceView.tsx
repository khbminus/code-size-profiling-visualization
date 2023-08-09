import {Highlight, themes} from "prism-react-renderer";
import type {FunctionPosition, SourceMapSegment} from "~/models/sourceMap.server";
import {Queue} from "queue-typescript"
import type {SpanMetaHolder} from "~/components/source-map/child-function";
import buildChildFunction from "~/components/source-map/child-function";
import {useMemo, useState} from "react";
import TabView from "~/components/source-map/TabView";

export interface SourceViewProps {
    language: string,
    segments: SourceMapSegment[],
    palette: string[],
    metaHolder: Map<string, SpanMetaHolder>,
    files: string[],
    fileContent: (string | null)[],
    scrollInitialTo: FunctionPosition | null
}

export default function SourceView({
                                       language,
                                       segments,
                                       palette,
                                       metaHolder,
                                       files,
                                       fileContent,
                                       scrollInitialTo
                                   }: SourceViewProps) {
    const [selectedName, setSelectedName] = useState(0);
    const segmentsQueues = useMemo(() => {
        const res: SourceMapSegment[][] = [];
        for (let i = 0; i < files.length; i++) {
            res.push([]);
        }
        segments.forEach(segment => {
            res[segment.sourceFileIndex].push(segment);
        })
        res.forEach(arr => arr.sort((a, b) => {
            if (a.startCursor.line == b.startCursor.line) {
                return a.startCursor.column - b.startCursor.column;
            }
            return a.startCursor.line - b.startCursor.line;
        }));
        return res.map(arr => new Queue(...arr));
    }, [files.length, segments]);

    const content = fileContent[selectedName];
    const queue = segmentsQueues[selectedName];
    return <div className="min-h-screen max-h-screen overflow-y-hidden flex flex-col">
        <TabView selectedName={selectedName} setSelectedName={setSelectedName} names={files}/>
        {content === null
            ? <span className="text-9xl font-black">File content is not available</span>
            : <div className="overflow-y-scroll">
                <Highlight
                    code={content}
                    language={language}
                    theme={themes.github}
                >
                    {buildChildFunction(queue, palette, metaHolder, scrollInitialTo)}
                </Highlight>
            </div>
        }
    </div>
}