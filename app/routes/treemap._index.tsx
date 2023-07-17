import type {LinksFunction} from "@remix-run/node";
import "@react-sigma/core/lib/react-sigma.min.css";
import "react-checkbox-tree/lib/react-checkbox-tree.css"
import styles from "style.css"
import {Link, useLoaderData} from "@remix-run/react";
import {isDiffIrMapExists, isLeftIrMapExists, isRightIrMapExists} from "~/models/exists.server";
import {json} from "@remix-run/node";

export const links: LinksFunction = () => [{
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
},
    {rel: "stylesheet", href: styles}
];

export const loader = () => {
    return json({leftIrMap: isLeftIrMapExists(), rightIrMap: isRightIrMapExists(), diffIrMap: isDiffIrMapExists()});
}

export default function GraphIndexPage() {
    const {leftIrMap, rightIrMap, diffIrMap} = useLoaderData<typeof loader>();
    return (
        <div style={{fontFamily: "system-ui, sans-serif", lineHeight: "1.8"}}>
            <h1>Treemap visualizations</h1>
            <ul>
                {leftIrMap ?
                    <li>
                        <Link to="/treemap/left">
                            Treemap visualization of the first (left, old) version
                        </Link>
                    </li>
                    : <></>
                }
                {rightIrMap ?
                    <li>
                        <Link to="/treemap/right">
                            Treemap visualization of the second (right, new) version
                        </Link>
                    </li>
                    : <></>
                }
                {diffIrMap ?
                    <li>
                        <Link to="/treemap/diff">
                            Treemap visualization of the difference between two versions
                        </Link>
                    </li>
                    : <></>
                }
            </ul>
        </div>
    )
}




