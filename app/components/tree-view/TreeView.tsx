import React, {useState} from 'react';
import CheckboxTree from 'react-checkbox-tree';
import type {Node} from "~/components/tree-view/processData";

interface TreeViewProps {
    checked: string[],
    setCheck: (_: string[]) => void,
    nodes: Node[]
}
export default function TreeView(props: TreeViewProps) {
    const [expanded, setExpanded] = useState<string[]>([]);
    const {
        checked,
        setCheck,
        nodes
    } = props;
    return (
        <CheckboxTree
            nodes={nodes}
            checked={checked}
            expanded={expanded}
            onCheck={checked => setCheck(checked)}
            onExpand={expanded => setExpanded(expanded)}
        />
    );
}