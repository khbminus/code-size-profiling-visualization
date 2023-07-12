import React from 'react';
import CheckboxTree from 'react-checkbox-tree';
import type {Node} from "~/components/tree-view/processData";

interface TreeViewProps {
    checked: string[],
    expanded: string[],
    setCheck: (_: string[]) => void,
    setExpanded: (_: string[]) => void,
    nodes: Node[]
}
export default function TreeView(props: TreeViewProps) {
    const {
        checked,
        expanded,
        setCheck,
        setExpanded,
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