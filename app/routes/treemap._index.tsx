import {getShallowIrMapLeft, getRetainedIrMapLeft} from "~/models/irMaps.server";
import {json, LinksFunction} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {TreeMapNodeCategory} from "~/components/treemap/processData";
import TreeMap from "~/components/treemap/treemap";
import {ClientOnly} from "remix-utils";
import Skeleton from "react-loading-skeleton";
import TreeView from "~/components/tree-view/TreeView";

import "react-checkbox-tree/lib/react-checkbox-tree.css"
import {useState} from "react";

export const links: LinksFunction = () => [{
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
}]

export const loader = async () => {
    return json({shallowMap: await getShallowIrMapLeft(), retainedMap: await getRetainedIrMapLeft()});
}


export default function TreeMapPage() {
    const [checked, setChecked] = useState<string[]>([]);
    const [expanded, setExpanded] = useState<string[]>([]);
    const {shallowMap, retainedMap} = useLoaderData<typeof loader>();
    const irMapSecondary = new Map(Object.entries(shallowMap));
    const irMapPrimary = new Map(Object.entries(retainedMap));
    const minimumRadius = 0;
    const renderNames = [...irMapSecondary.keys()];
    const topCategory = TreeMapNodeCategory.RETAINED;

    return <ClientOnly fallback={<Skeleton/>}>
        {() =>
            <div id={"content"}>
                <div style={{float: "left"}}>
                    <TreeMap
                        primaryIrMap={irMapPrimary}
                        secondaryIrMap={irMapSecondary}
                        minimumRadius={minimumRadius}
                        renderableNames={renderNames}
                        topCategory={topCategory}
                        width={window.innerWidth * 0.8}
                        height={window.innerHeight * 0.97}
                    ></TreeMap>
                </div>
                <div style={{float: "right"}}>
                    <TreeView
                        checked={checked}
                        expanded={expanded}
                        setCheck={setChecked}
                        setExpanded={setExpanded}
                    ></TreeView>
                </div>
            </div>}
    </ClientOnly>
}