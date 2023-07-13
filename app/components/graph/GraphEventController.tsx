import {useRegisterEvents} from "@react-sigma/core";
import {useEffect} from "react";

export default function GraphEventController({setHovered}: { setHovered: (newHovered: string | null) => void }) {
    const registerEvents = useRegisterEvents();
    useEffect(() => {
        registerEvents({
            enterNode({node}) {
                setHovered(node);
            },
            leaveNode() {
                setHovered(null);
            }
        })
    }, [registerEvents]);
    return <></>;
}