import * as d3 from "d3";
import type {TreeMapNode} from "~/components/treemap/processData";
import {TreeMapNodeCategory} from "~/components/treemap/processData";
import invariant from "tiny-invariant";

type D3Node = d3.HierarchyRectangularNode<TreeMapNode>;

export class TreeMapRenderer {
    private static numberFormat = d3.format(",d");
    private static ratioFormat = d3.format(".4f");
    private static collectName = (d: D3Node) =>
        d.ancestors().reverse().map(d => d.data.name).join("/");

    private group: d3.Selection<SVGGElement, any, any, any>;
    private readonly x: d3.ScaleLinear<number, number>
    private readonly y: d3.ScaleLinear<number, number>
    private path: string[]

    constructor(private svg: d3.Selection<SVGGElement, any, any, any>, private width: number, private height: number,
                private newPathCallback: (path: string[]) => void, path: string[]) {
        this.group = svg
            .append("g")
        this.x = d3
            .scaleLinear()
            .rangeRound([0, this.width]);
        this.y = d3
            .scaleLinear()
            .rangeRound([0, this.height]);
        this.path = path.slice()

    }

    public renderTreeMap(node: D3Node) {
        this.x.domain([node.x0, node.x1]);
        this.y.domain([node.y0, node.y1]);
        this.render(this.group, node);
    }

    private render(group: d3.Selection<SVGGElement, any, any, any>, root: D3Node) {
        if (root.children === undefined) {
            return;
        }
        const node = group
            .selectAll("g")
            .data(root.children.concat(root))
            .join("g");
        node.filter(d => d === root ? d.parent !== null : d.children !== undefined)
            .attr("cursor", "pointer")
            .on("click", (event, d) => d === root ? this.zoomOut(root) : this.zoomIn(d));

        node
            .append("title")
            .text(d => {
                invariant(d.value !== undefined, `d.value for ${d.data.name} is undefined`);
                let title = [TreeMapRenderer.collectName(d)];
                title = title.concat(TreeMapRenderer.numberFormat(d.value));
                if (d.data.shallowValue !== null) {
                    title = title.concat(TreeMapRenderer.numberFormat(d.data.shallowValue)).concat(TreeMapRenderer.ratioFormat(d.data.shallowValue / d.value));
                }
                return title.join("\n");
            });
        node
            .append("rect")
            .attr("id", d => `leaf${this.getId(d.data)}`)
            .attr("fill", d => {
                if (d === root) {
                    return "#fff";
                }
                if (d.data.category === TreeMapNodeCategory.RETAINED) {
                    return "#56B870";
                }
                if (d.children || d.data.category === TreeMapNodeCategory.MIDDLE) {
                    return "#ccc";
                }
                return "#347EB4";
            })
            .attr("stroke", "#fff");

        node.append("clipPath")
            .attr("id", d => `clip${this.getId(d.data)}`)
            .append("use")
            .attr("xlink:href", d => `#leaf${this.getId(d.data)}`);
        node.append("text")
            .attr("clip-path", d => `url(#clip${this.getId(d.data)})`)
            .attr("font-weight", d => d === root ? "bold" : null)
            .selectAll("tspan")
            .data(d => {
                invariant(d.value !== undefined, "value is undefined for " + d.data.name);
                let x: string[] = [(d === root ? TreeMapRenderer.collectName(d) : d.data.name)];
                const rootSize = (d.data.category == TreeMapNodeCategory.SHALLOW ? "Shallow" : "Retained")
                x = x.concat(`${rootSize} size: ${TreeMapRenderer.numberFormat(d.value)}`);
                if (d !== root && d.data.shallowValue !== null) {
                    x = x.concat(`Shallow size: ${TreeMapRenderer.numberFormat(d.data.shallowValue)}`);
                    x = x.concat(`Shallow/Retained ratio: ${TreeMapRenderer.ratioFormat(d.data.shallowValue / d.value)}`);
                }
                return x;
            })
            .join("tspan")
            .attr("x", 3)
            .attr("y", (d, i, nodes) => {
                const coefficient = (i === nodes.length - 1) ? 1 : 0;
                return `${coefficient * 0.3 + 1.1 + i * 0.9}em`
            })
            .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
            .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
            .attr("fill", d => {
                if (d.startsWith("Shallow/")) {
                    return "#b77700";
                } else if (d.startsWith("Shallow ")) {
                    return "#2F4F4F";
                }
                return null;
            })
            .text(d => d);
        group.call(this.position.bind(this), root);
    }

    private position(group: d3.Selection<SVGGElement, any, any, any>, root: D3Node) {
        group.selectAll<SVGElement, D3Node>("g")
            .attr("transform", d => {
                return d === root ? `translate(0,-30)` : `translate(${this.x(d.x0)},${this.y(d.y0)})`
            })
            .select("rect")
            .attr("width", d => d === root ? this.width : this.x(d.x1) - this.x(d.x0))
            .attr("height", d => d === root ? 30 : this.y(d.y1) - this.y(d.y0));
    }

    private idMap: Map<TreeMapNode, number> = new Map();

    private getId(node: TreeMapNode): number {
        const value = this.idMap.get(node);
        if (value !== undefined) {
            return value;
        }
        const length = this.idMap.size;
        this.idMap.set(node, length);
        return length;

    }

    private zoomIn(d: D3Node) {
        const group0 = this.group.attr("pointer-events", "none");
        const group1 = this.group = this.svg.append("g").call(this.render.bind(this), d);
        const nextPath = this.path.slice();
        nextPath.push(d.data.name);
        this.newPathCallback(nextPath);
        this.path = nextPath;

        this.x.domain([d.x0, d.x1]);
        this.y.domain([d.y0, d.y1]);

        this.svg.transition()
            .duration(750)
            .call(t =>
                group0
                    // @ts-ignore
                    .transition(t)
                    .remove()
                    // @ts-ignore
                    .call(this.position.bind(this), d.parent))
            .call(t =>
                // @ts-ignore
                group1
                    // @ts-ignore
                    .transition(t)
                    .attrTween("opacity", () => d3.interpolate(0, 1))
                    // @ts-ignore
                    ?.call(this.position.bind(this), d));
    }

    private zoomOut(d: D3Node) {
        if (d.parent === null) {
            return;
        }
        const group0 = this.group.attr("pointer-events", "none");
        const group1 = this.group = this.svg.insert("g", "*").call(this.render.bind(this), d.parent);

        const nextPath = this.path.slice();
        nextPath.pop();
        this.newPathCallback(nextPath);
        this.path = nextPath;

        this.x.domain([d.parent.x0, d.parent.x1]);
        this.y.domain([d.parent.y0, d.parent.y1]);

        this.svg.transition()
            .duration(750)
            // @ts-ignore
            .call(t => group0
                // @ts-ignore
                .transition(t)
                .remove()
                .attrTween("opacity", () => d3.interpolate(1, 0))
                // @ts-ignore
                ?.call(this.position.bind(this), d))
            .call(t => group1
                // @ts-ignore
                .transition(t)
                .call(
                    // @ts-ignore
                    this.position.bind(this),
                    d.parent
                )
            );
    }
}