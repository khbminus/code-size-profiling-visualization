import {useMemo, useState} from "react";
import {processNames} from "~/components/tree-view/processData";
import Graph from "~/components/graph/Graph";
import TreeView from "~/components/tree-view/TreeView";
import type {IrEntry} from "~/models/irMaps.server";
import type {Edge} from "~/models/graph.server";
import TypeTreeView from "~/components/tree-view/TypeTreeView";

interface GraphPageProps {
    nodes: [string, IrEntry][],
    edges: Edge[]
}

export default function GraphPage({nodes, edges}: GraphPageProps) {
    const [checkedNames, setCheckedNames] = useState<string[]>([]);
    const [checkedNamesByType, setCheckedNameByType] = useState<string[]>([]);
    const renderNames = useMemo(() => {
        const set1 = new Set(checkedNames);
        return checkedNamesByType.filter(x => set1.has(x));
    }, [checkedNames, checkedNamesByType]);
    const [treeViewNodes] = useState(() =>
        processNames(nodes.map(([name, _]) => name)));

    const [maxDepth, setMaxDepth] = useState(3);


    return (
        <div id="content">
            <Graph nodes={nodes} edges={edges} renderNames={renderNames} maxDepth={maxDepth}/>
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
                <h4>Types:</h4>
                <TypeTreeView irEntries={nodes} setCheckedByType={setCheckedNameByType}/>
                <h4>Names:</h4>
                <TreeView checked={checkedNames} setCheck={setCheckedNames}
                          nodes={treeViewNodes}/>
            </div>
        </div>
    )
}