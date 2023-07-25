import type {TokenOutputProps} from "prism-react-renderer";
import {useRef} from "react";
import type {SpanMetaHolder} from "~/components/source-map/child-function";
import type {SegmentInfo} from "~/components/source-map/process-tokens";

interface TokenComponentProps {
    attrs: TokenOutputProps,
    segmentInfo: SegmentInfo | null,
    metaHolder: Map<string, SpanMetaHolder>
}

export default function TokenComponent({attrs, metaHolder, segmentInfo}: TokenComponentProps) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const onHoverStart = () => {
        console.log("HOVER STARTED", segmentInfo, ref.current);
        const span = ref.current
        if (span !== null) {
            span.style.borderWidth = "1px";
            span.style.borderColor = "black";
            // span.style.borderCollapse = "collapse";
        }
    }
    const onHoverEnd = () => {
        const span = ref.current;
        console.log("HOVER ENDED", segmentInfo, ref.current);

        if (span !== null) {
            span.style.borderWidth = "0px";
        }
    }
    if (segmentInfo === null) {
        return <span {...attrs}></span>
    }

    const key = getKey(segmentInfo);
    metaHolder.set(key, {onHoverStart, onHoverEnd});
    const inverted: SegmentInfo = {
        language: (segmentInfo.language === "wasm" ? "kotlin" : "wasm"),
        id: segmentInfo.id
    };
    const invertedKey = getKey(inverted);

    const onMouseEnter = () => {
        onHoverStart();
        metaHolder.get(invertedKey)?.onHoverStart();
    }
    const onMouseLeave = () => {
        onHoverEnd();
        metaHolder.get(invertedKey)?.onHoverEnd();
    }
    return <span ref={ref} {...attrs} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}></span>
}

function getKey(segment: SegmentInfo): string {
    return JSON.stringify(segment);
}