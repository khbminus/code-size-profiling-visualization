import type {IrEntry} from "~/models/irMaps.server";
import {useEffect, useMemo, useState} from "react";
import TreeView from "~/components/tree-view/TreeView";
import type {Node} from "~/components/tree-view/processData";
import invariant from "tiny-invariant";
import {palette} from "~/components/palette";

const Color = require("color");

interface TypeTreeViewProps {
    irEntries: [string, IrEntry][],
    setCheckedByType: (newValue: string[]) => void
    colored: boolean
}

function buildMap(irEntries: [string, IrEntry][]) {
    const returnValue = new Map<string, string[]>();
    irEntries.forEach(([name, entry]) => {
        const arr = returnValue.get(entry.type) || [];
        arr.push(name);
        returnValue.set(entry.type, arr);
    });
    return returnValue;
}

export default function TypeTreeView({irEntries, setCheckedByType, colored}: TypeTreeViewProps) {
    const typeMap = useMemo(() => buildMap(irEntries), [irEntries]);
    const [checkedTypes, setCheckedTypes] = useState([...typeMap.keys()]);
    const nodes = useMemo(() => [...typeMap.keys()].map((name: string): Node => {
        const label = colored
            ? <>Type: <span style={{
                color: Color(palette.get(name)).rotate(180).hex(),
                background: palette.get(name)
            }}>{name}</span></>
            : <>Type: {name}</>
        return {
            label: label,
            value: name
        }
    }), [typeMap, colored])
    useEffect(() => {
        const allNames = [...typeMap.keys()].reduce((a, b) => {
            const arr = typeMap.get(b);
            invariant(arr !== undefined, "unknown type");
            return a.concat(arr);
        }, [] as string[]);
        setCheckedTypes([...typeMap.keys()]);
        setCheckedByType(allNames);
    }, [typeMap, setCheckedByType]);
    return <TreeView
        checked={checkedTypes}
        nodes={nodes}
        setCheck={(types => {
            const allNames = types.reduce((a, b) => {
                const arr = typeMap.get(b);
                invariant(arr !== undefined, "unknown type");
                return a.concat(arr);
            }, [] as string[]);
            setCheckedTypes(types);
            setCheckedByType(allNames);
        })}
    />
}