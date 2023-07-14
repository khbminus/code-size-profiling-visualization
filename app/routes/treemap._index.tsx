import {getShallowIrMapLeft, getRetainedIrMapLeft} from "~/models/irMaps.server";
import type {LinksFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {TreeMapNodeCategory} from "~/components/treemap/processData";
import TreeMap from "~/components/treemap/treemap";
import {ClientOnly} from "remix-utils";
import Skeleton from "react-loading-skeleton";
import TreeView from "~/components/tree-view/TreeView";

import "react-checkbox-tree/lib/react-checkbox-tree.css"
import styles from "style.css"
import {useMemo, useState} from "react";
import {processNames} from "~/components/tree-view/processData";
import {max} from "d3";

export const links: LinksFunction = () => [{
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
}, {
    rel: "stylesheet",
    href: styles
}
]


export const loader = async () => {
    return json({shallowMap: await getShallowIrMapLeft(), retainedMap: await getRetainedIrMapLeft()});
}


export default function TreeMapPage() {
    const {shallowMap, retainedMap} = useLoaderData<typeof loader>();
    const irMapSecondary = useMemo(() => new Map(Object.entries(shallowMap)), [shallowMap]);
    const irMapPrimary = useMemo(() => new Map(Object.entries(retainedMap)), [retainedMap]);

    const [checked, setChecked] = useState([...irMapSecondary.keys()]);

    const treeViewNodes = processNames([...irMapSecondary.keys()]);

    const [minSize, maxSize] = useMemo(
        () => [...irMapPrimary.values()].reduce(([mn, mx], {size}) =>
            [Math.min(mn, size), Math.max(mx, size)], [Infinity, -Infinity] as [number, number]), [irMapPrimary]);
    console.log(minSize, maxSize);
    const [minimumRadius, setRadius] = useState(0);
    const topCategory = TreeMapNodeCategory.RETAINED;

    return <ClientOnly fallback={<Skeleton/>}>
        {() =>
            <div id={"content"} style={{overflow: "hidden"}}>
                <div style={{float: "left"}}>
                    <TreeMap
                        primaryIrMap={irMapPrimary}
                        secondaryIrMap={irMapSecondary}
                        minimumRadius={minimumRadius}
                        renderableNames={checked}
                        topCategory={topCategory}
                        width={window.innerWidth * 0.8}
                        height={window.innerHeight * 0.97}
                    ></TreeMap>
                </div>
                <div className="treemap-side-bar">
                    <div className="minimum-size-chooser">
                        <label htmlFor="minimumSize" className="size-label">Minimum retained size to display:
                        </label>
                        <input type="range"
                               id="minimumSize"
                               name="minimumSize"
                               value={minimumRadius}
                               onChange={e => setRadius(e.target.valueAsNumber)}
                               min={minSize}
                               max={maxSize}
                        />
                        <span className="minimum-size-viewer">{minimumRadius}</span>
                    </div>
                    <TreeView
                        checked={checked}
                        setCheck={setChecked}
                        nodes={treeViewNodes}
                    ></TreeView>
                </div>
            </div>}
    </ClientOnly>
}