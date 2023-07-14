import type {LinksFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {getRegularGraphLeft} from "~/models/graph.server";
import {useLoaderData} from "@remix-run/react";
import {useState} from "react";
import "@react-sigma/core/lib/react-sigma.min.css";
import {processNames} from "~/components/tree-view/processData";
import "react-checkbox-tree/lib/react-checkbox-tree.css"
import TreeView from "~/components/tree-view/TreeView";
import Graph from "~/components/graph/Graph";
import "style.css"
export const loader = async () => {
    const {nodes, edges} = await getRegularGraphLeft();
    return json({nodes: [...nodes.entries()], edges: edges});
}

export const links: LinksFunction = () => [{
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
}
];

export default function GraphPage() {
    const {nodes, edges} = useLoaderData<typeof loader>();
    const [checked, setChecked] = useState<string[]>([]);
    const [treeViewNodes] = useState(() =>
        processNames(nodes.map(([name, _]) => name)));

    const [maxDepth, setMaxDepth] = useState(3);

    return (
        <div id="content">
            <Graph nodes={nodes} edges={edges} renderNames={checked} maxDepth={maxDepth}/>
            <div className="treemap-side-bar">
                <input
                    type="range"
                    min={"1"}
                    max={"20"}
                    value={maxDepth}
                    onChange={e => setMaxDepth(e.target.valueAsNumber)}
                />
                <TreeView checked={checked} setCheck={setChecked}
                          nodes={treeViewNodes}/>
            </div>
        </div>
    )
}


