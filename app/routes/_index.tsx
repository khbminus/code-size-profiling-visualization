import type { V2_MetaFunction } from "@remix-run/node";
import {Link} from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Code size profiler" },
    { name: "description", content: "Code size profiler for your Kotlin/Wasm project" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Code Size Profiler</h1>
      <ul>
        <li>
          <Link to="/graph">
            Graph visualization
          </Link>
        </li>
        <li>
          <Link to="/treemap">
            Treemap visualization
          </Link>
        </li>
      </ul>
    </div>
  );
}
