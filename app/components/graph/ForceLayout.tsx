import {useSigma} from "@react-sigma/core";
import {useWorkerLayoutForceAtlas2} from "@react-sigma/layout-forceatlas2";
import {useEffect} from "react";

export default function ForceLayout() {
    const sigma = useSigma();
    const {start, kill} = useWorkerLayoutForceAtlas2({
        settings: {
            barnesHutOptimize: sigma.getGraph().order > 10000,
            slowDown: 8,
            adjustSizes: true,
            gravity: 0.3
        }
    });
    useEffect(() => {
        start();
        return () => {
            kill();
        }
    }, [start, kill]);
    return <></>;
}