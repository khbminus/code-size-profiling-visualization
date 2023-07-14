import {getRetainedIrMapLeft, getShallowIrMapLeft, IrEntry, IrMap} from "~/models/irMaps.server";
import type {LinksFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import "react-checkbox-tree/lib/react-checkbox-tree.css"
import styles from "style.css"
import {useLoaderData} from "@remix-run/react";
import TreeMapPage from "~/components/treemap/TreeMapPage";
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

export default function LeftTreeMap() {
    const {shallowMap, retainedMap} = useLoaderData<typeof loader>();
    return <TreeMapPage shallowMap={shallowMap} retainedMap={retainedMap}/>
}

