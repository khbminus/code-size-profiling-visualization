import {useState} from "react";
import {processNames} from "~/components/tree-view/processData";
import Graph from "~/components/graph/Graph";
import TreeView from "~/components/tree-view/TreeView";
import type {IrEntry} from "~/models/irMaps.server";
import type {Edge} from "~/models/graph.server";

interface GraphPageProps {
    nodes: [string, IrEntry][],
    edges: Edge[]
}

export default function GraphPage({nodes, edges}: GraphPageProps) {
    const [checked, setChecked] = useState<string[]>([]);
    const [treeViewNodes] = useState(() =>
        processNames(nodes.map(([name, _]) => name)));

    const [maxDepth, setMaxDepth] = useState(3);

    return (
        <div id="content">
            <Graph nodes={nodes} edges={edges} renderNames={checked} maxDepth={maxDepth}/>
            <div className="treemap-side-bar">
                <div className="depth-select-wrapper">
                    <label htmlFor="depth-select">Select maximum depth: </label>
                    <input
                        className="depth-select"
                        type="range"
                        min="1"
                        max="20"
                        value={maxDepth}
                        onChange={e => setMaxDepth(e.target.valueAsNumber)}
                        name="depth-select"
                    />
                    <span className="depth-select-value">{maxDepth}</span>
                </div>
                <TreeView checked={checked} setCheck={setChecked}
                          nodes={treeViewNodes}/>
            </div>
        </div>
    )
}