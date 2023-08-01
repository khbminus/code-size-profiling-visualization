import {getRegularGraphRight} from "~/models/graph.server";
import type {LinksFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import GraphPage from "~/components/graph/GraphPage";
import "react-checkbox-tree/lib/react-checkbox-tree.css"
import styles from "style.css";
import invariant from "tiny-invariant";
import {useMemo} from "react";
import {buildIrMap} from "~/utils";

export const loader = async () => {
    const {nodes, edges, retainedNodes} = await getRegularGraphRight();
    return json({nodes: [...nodes.entries()], edges: edges, retainedNodes: retainedNodes});
}

export const links: LinksFunction = () => [{
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
},
    {rel: "stylesheet", href: styles}
];

export default function LeftGraph() {
    const {nodes, edges, retainedNodes} = useLoaderData<typeof loader>();
    invariant(retainedNodes !== null);
    const retainedMap = useMemo(() => buildIrMap(retainedNodes), [retainedNodes]);
    return <GraphPage
        nodes={nodes}
        edges={edges}
        retainedSizes={retainedMap}
    ></GraphPage>
}