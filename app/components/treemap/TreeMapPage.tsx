import type {IrMap} from "~/models/irMaps.server";
import {useMemo, useState} from "react";
import {processNames} from "~/components/tree-view/processData";
import {ClientOnly} from "remix-utils";
import Skeleton from "react-loading-skeleton";
import TreeMap from "~/components/treemap/treemap";
import {TreeMapNodeCategory} from "~/components/treemap/processData";
import MinimumSizeChooser from "~/components/treemap/MinimumSizeChooser";
import TreeView from "~/components/tree-view/TreeView";

interface TreeMapPageProps {
    shallowMap: IrMap,
    retainedMap: IrMap
}

export default function TreeMapPage({shallowMap, retainedMap}: TreeMapPageProps) {
    const irMapSecondary = useMemo(() => new Map(Object.entries(shallowMap)), [shallowMap]);
    const irMapPrimary = useMemo(() => new Map(Object.entries(retainedMap)), [retainedMap]);

    const [checked, setChecked] = useState([...irMapSecondary.keys()]);

    const treeViewNodes = processNames([...irMapSecondary.keys()]);

    const [minSize, maxSize] = useMemo(
        () => [...irMapPrimary.values()].reduce(([mn, mx], {size}) =>
            [Math.min(mn, size), Math.max(mx, size)], [Infinity, -Infinity] as [number, number]), [irMapPrimary]);
    const [minimumRadius, setRadius] = useState(0);
    const [viewMode, setViewMode] = useState("middle");

    return <ClientOnly fallback={<Skeleton/>}>
        {() =>
            <div id={"content"} style={{overflow: "hidden"}}>
                <div style={{float: "left"}}>
                    <TreeMap
                        primaryIrMap={viewMode === "shallow" ? irMapSecondary : irMapPrimary}
                        secondaryIrMap={viewMode === "middle" ? irMapSecondary : null}
                        minimumRadius={minimumRadius}
                        renderableNames={checked}
                        topCategory={viewMode === "shallow" ? TreeMapNodeCategory.SHALLOW : TreeMapNodeCategory.RETAINED}
                        width={window.innerWidth * 0.75}
                        height={window.innerHeight * 0.97}
                    ></TreeMap>
                </div>
                <div className="treemap-side-bar">
                    <MinimumSizeChooser
                        minimumRadius={minimumRadius}
                        setRadius={setRadius}
                        minSize={minSize}
                        maxSize={maxSize}
                        viewMode={viewMode}
                    />
                    <select
                        name="viewMode"
                        value={viewMode}
                        onChange={e => setViewMode(e.target.value)}
                    >
                        <option value="middle">Show shallow and retained size</option>
                        <option value="shallow">Show only shallow size</option>
                        <option value="retained">Show only retained size</option>
                    </select>
                    <TreeView
                        checked={checked}
                        setCheck={setChecked}
                        nodes={treeViewNodes}
                    />
                </div>
            </div>}
    </ClientOnly>
}