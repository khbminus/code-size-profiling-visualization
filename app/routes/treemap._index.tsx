import type {LinksFunction} from "@remix-run/node";
import "@react-sigma/core/lib/react-sigma.min.css";
import "react-checkbox-tree/lib/react-checkbox-tree.css"
import styles from "style.css"
import {Link} from "@remix-run/react";
import {isDiffIrMapExists, isLeftIrMapExists, isRightIrMapExists} from "~/models/exists.server";

export const links: LinksFunction = () => [{
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
},
    {rel: "stylesheet", href: styles}
];

export default function GraphIndexPage() {
    return (
        <div style={{fontFamily: "system-ui, sans-serif", lineHeight: "1.8"}}>
            <h1>Treemap visualizations</h1>
            <ul>
                <li>
                    {isLeftIrMapExists() ?
                        <Link to="/treemap/left">
                            Treemap visualization of the first (left, old) version
                        </Link>
                        : <></>
                    }
                </li>
                <li>
                    {isRightIrMapExists() ?
                        <Link to="/treemap/right">
                            Treemap visualization of the second (right, new) version
                        </Link>
                        : <></>
                    }
                </li>
                <li>
                    {isDiffIrMapExists() ? <Link to="/treemap/diff">
                            Treemap visualization of the difference between two versions
                        </Link>
                        : <></>
                    }
                </li>
            </ul>
        </div>
    )
}




