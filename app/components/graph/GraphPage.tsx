import {useMemo, useState} from "react";
import {processNames} from "~/components/tree-view/processData";
import Graph from "~/components/graph/Graph";
import TreeView from "~/components/tree-view/TreeView";
import type {IrEntry} from "~/models/irMaps.server";
import type {Edge} from "~/models/graph.server";
import TypeTreeView from "~/components/tree-view/TypeTreeView";

interface GraphPageProps {
    nodes: [string, IrEntry][],
    retainedSizes: Map<string, IrEntry> | null
    edges: Edge[]
}

export default function GraphPage({nodes, edges, retainedSizes}: GraphPageProps) {
    const [checkedNames, setCheckedNames] = useState<string[]>([]);
    const [allowedNames, setAllowedNames] = useState<string[]>([]);
    const treeViewNodes = useMemo(() =>
        processNames(nodes.map(([name, entry]) => [entry.displayName || name, name])), [nodes]);

    const [maxDepth, setMaxDepth] = useState(3);

    return (
        <div id="content">
            <Graph
                nodes={nodes}
                edges={edges}
                renderNames={checkedNames}
                maxDepth={maxDepth}
                retainedNodes={retainedSizes}
                allowedNames={allowedNames}
            />
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
                <h4>Types (disabling type remove all nodes of this type):</h4>
                <TypeTreeView irEntries={nodes} setCheckedByType={setAllowedNames} colored={true}/>
                <h4>Names:</h4>
                <TreeView checked={checkedNames} setCheck={setCheckedNames}
                          nodes={treeViewNodes}/>
            </div>
        </div>
    )
}