import type {V2_MetaFunction} from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";
import {linkClassName} from "~/utils";
import {isSourceMapExists} from "~/models/exists.server";
import {json} from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
    return [
        {title: "Code size profiler"},
        {name: "description", content: "Code size profiler for your Kotlin/Wasm project"},
    ];
};

export const loader = async () => {
    const isSrc = isSourceMapExists();
    return json({isSrc});
}

export default function Index() {
    const {isSrc} = useLoaderData<typeof loader>();
    return (
        <div style={{fontFamily: "system-ui, sans-serif", lineHeight: "1.8"}}>
            <h1>Welcome to Code Size Profiler</h1>
            <ul>
                <li>
                    <Link to="/graph" className={linkClassName}>
                        Graph visualization
                    </Link>
                </li>
                <li>
                    <Link to="/treemap" className={linkClassName}>
                        Treemap visualization
                    </Link>
                </li>
                <li>
                    {isSrc
                        ? <Link to="/sourcemap" className={linkClassName}>
                            Kotlin to WAT mapping
                        </Link>
                        : <></>
                    }
                </li>
            </ul>
        </div>
    );
}
