import {getKotlinFiles, getWatFiles, loadFunctionPositions, loadSegments} from "~/models/sourceMap.server";
import type { LoaderArgs} from "@remix-run/node";
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


export const loader = async ({params}: LoaderArgs) => {
    const segments = await loadSegments();
    const kotlinFiles = await getKotlinFiles();
    const watFiles = await getWatFiles();
    const functionsPositions = await loadFunctionPositions();
    return json({
        kotlinFiles: kotlinFiles,
        watFiles: watFiles,
        kotlinSegments: segments.map(seg => seg.kotlinSegment),
        watSegments: segments.map(seg => seg.watSegment),
        functionPositions: functionsPositions,
        scrollKtTo: params.name
    });
}
export default function SourceMapVisualization() {
    const {
        kotlinFiles,
        watFiles,
        kotlinSegments,
        watSegments,
        functionPositions,
        scrollKtTo
    } = useLoaderData<typeof loader>();
    const palette = useMemo(() => iwanthue(
        kotlinSegments.length,
        {colorSpace: "pastel", seed: "LetsTryAnotherOne"}
    ), [kotlinSegments]);

    const metaHolder = new Map<string, SpanMetaHolder>();

    return <div className="content-container font-mono w-full">
        <div className="kt-source flex-1 whitespace-pre-line w-1/2 absolute left-0">
            <SourceView
                language="kotlin"
                fileContent={kotlinFiles.fileContents}
                files={kotlinFiles.files}
                segments={kotlinSegments}
                palette={palette}
                metaHolder={metaHolder}
                scrollInitialTo={null}
            />
        </div>
        <div className="wasm-source flex-1 whitespace-pre-line w-1/2 absolute right-0">
            <SourceView
                language="wasm"
                fileContent={watFiles.fileContents}
                segments={watSegments}
                palette={palette}
                metaHolder={metaHolder}
                files={watFiles.files}
                scrollInitialTo={(scrollKtTo !== undefined && scrollKtTo in functionPositions) ? functionPositions[scrollKtTo] : null}
            />
        </div>
    </div>
}