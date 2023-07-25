import {loadKotlinSourceCode, loadSegments, loadWasmSourceCode} from "~/models/sourceMap.server";
import {json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {Prism} from "prism-react-renderer";
import SourceView from "~/components/source-map/SourceView";
import {useMemo} from "react";
import type {SpanMetaHolder} from "~/components/source-map/child-function";
import iwanthue from "iwanthue";

(typeof global !== "undefined" ? global : window).Prism = Prism;
require("prismjs/components/prism-kotlin");
require("prismjs/components/prism-wasm");


export const loader = async () => {
    const kotlinText = await loadKotlinSourceCode();
    const wasmText = await loadWasmSourceCode();
    const segments = await loadSegments();
    return json({
        kotlinText: kotlinText,
        wasmText: wasmText,
        kotlinSegments: segments.map(seg => seg.kotlinSegment),
        watSegments: segments.map(seg => seg.watSegment)
    });
}
export default function SourceMapVisualization() {
    const {
        kotlinText,
        wasmText,
        kotlinSegments,
        watSegments
    } = useLoaderData<typeof loader>();

    const palette = useMemo(() => iwanthue(
        kotlinSegments.length,
        {colorSpace: "pastel", seed: "LetsTryAnotherOne"}
    ), [kotlinSegments]);

    const metaHolder = new Map<string, SpanMetaHolder>();

    return <div className="content-container flex min-h-screen max-h-screen font-mono">
        <div className="kt-source flex-1 whitespace-pre-line overflow-y-scroll">
            <SourceView language="kotlin" text={kotlinText} segments={kotlinSegments} palette={palette} metaHolder={metaHolder}/>
        </div>
        <div className="wasm-source flex-1 whitespace-pre-line overflow-y-scroll">
            <SourceView language="wasm" text={wasmText} segments={watSegments} palette={palette} metaHolder={metaHolder}/>
        </div>
    </div>
}