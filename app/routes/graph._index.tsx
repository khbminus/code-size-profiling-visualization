import type {LinksFunction} from "@remix-run/node";
import "@react-sigma/core/lib/react-sigma.min.css";
import "react-checkbox-tree/lib/react-checkbox-tree.css"
import styles from "style.css"
import {Link, useLoaderData} from "@remix-run/react";
import {isDiffGraphExists, isLeftGraphExists, isRightGraphExists} from "~/models/exists.server";
import {json} from "@remix-run/node";
import {linkClassName} from "~/utils";

export const links: LinksFunction = () => [{
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
},
    {rel: "stylesheet", href: styles}
];

export const loader = () => {
    return json({leftGraph: isLeftGraphExists(), rightGraph: isRightGraphExists(), diffGraph: isDiffGraphExists()})
}

export default function GraphIndexPage() {
    const {leftGraph, rightGraph, diffGraph} = useLoaderData<typeof loader>()
    return (
        <div style={{fontFamily: "system-ui, sans-serif", lineHeight: "1.8"}}>
            <h1>Graph visualizations</h1>
            <ul>
                {leftGraph
                    ? <li>
                        <Link to="/graph/left" className={linkClassName}>
                            Graph visualization of the first (left, old) version
                        </Link>
                    </li>
                    : <></>
                }
                {rightGraph
                    ? <li>
                        <Link to="/graph/right" className={linkClassName}>
                            Graph visualization of the second (right, new) version
                        </Link>
                    </li>
                    : <></>
                }
                {diffGraph
                    ? <li>
                        <Link to="/graph/diff" className={linkClassName}>
                            Graph visualization of the difference between two versions
                        </Link>
                    </li>
                    : <></>
                }

            </ul>
        </div>
    )
}




