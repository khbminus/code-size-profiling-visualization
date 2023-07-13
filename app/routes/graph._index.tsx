import type { LinksFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {getRegularGraphLeft} from "~/models/graph.server";
import {useLoaderData} from "@remix-run/react";
import {useState} from "react";
import "@react-sigma/core/lib/react-sigma.min.css";
import {processNames} from "~/components/tree-view/processData";
import "react-checkbox-tree/lib/react-checkbox-tree.css"
import TreeView from "~/components/tree-view/TreeView";
import Graph from "~/components/graph/Graph";

export const loader = async () => {
    const {nodes, edges} = await getRegularGraphLeft();
    return json({nodes: [...nodes.entries()], edges: edges});
}

export const links: LinksFunction = () => [{
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
}, {
    rel: "stylesheet",
    href: "/style.css"
}
];

export default function GraphPage() {
    const {nodes, edges} = useLoaderData<typeof loader>();
    const [checked, setChecked] = useState(() =>
        nodes.map(([name, _]) => name));
    const [treeViewNodes] = useState(() =>
        processNames(nodes.map(([name, _]) => name)));


    return (
        <div id="content">
            <Graph nodes={nodes} edges={edges} renderNames={checked}/>
            <TreeView checked={checked}  setCheck={setChecked}
                      nodes={treeViewNodes}/>
        </div>
    )
}


