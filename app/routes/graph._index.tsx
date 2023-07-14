import type {LinksFunction} from "@remix-run/node";
import "@react-sigma/core/lib/react-sigma.min.css";
import "react-checkbox-tree/lib/react-checkbox-tree.css"
import styles from "style.css"
import {Link} from "@remix-run/react";

export const links: LinksFunction = () => [{
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
},
    {rel: "stylesheet", href: styles}
];

export default function GraphIndexPage() {
    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
            <h1>Graph visualizations</h1>
            <ul>
                <li>
                    <Link to="/graph/left">
                        Graph visualization of the first (left, old) version
                    </Link>
                </li>
                <li>
                    <Link to="/graph/right">
                        Graph visualization of the second (right, new) version
                    </Link>
                </li>
                <li>
                    <Link to="/graph/diff">
                        Graph visualization of the difference between two versions
                    </Link>
                </li>
            </ul>
        </div>
    )
}




