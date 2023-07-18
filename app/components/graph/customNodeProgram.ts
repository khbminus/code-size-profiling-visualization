import type {NodeDisplayData} from "sigma/types";
import {floatColor} from "sigma/utils";
import {AbstractNodeProgram} from "sigma/rendering/webgl/programs/common/node";
import type {RenderParams} from "sigma/rendering/webgl/programs/common/program";
import NodeFastProgram from "sigma/rendering/webgl/programs/node.fast";

const POINTS = 2,
    ATTRIBUTES = 4;
const fragmentShaderSource = `precision mediump float;

varying vec4 v_color;
varying float v_border;

const float radius = 0.5;
const vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);

void main(void) {
    vec2 m = gl_PointCoord - vec2(0.5, 0.5);
    float dist = radius - length(m);

    float t = 0.0;
    if (dist > v_border)
    t = 1.0;
    else if (dist > 0.0)
    t = dist / v_border;

    gl_FragColor = mix(transparent, v_color, t);
}`;

const vertexShaderSource = `
attribute vec2 a_position;
attribute float a_size;
attribute vec4 a_color;

uniform float u_ratio;
uniform float u_scale;
uniform mat3 u_matrix;

varying vec4 v_color;
varying float v_border;

const float bias = 255.0 / 254.0;

void main() {
  gl_Position = vec4(
    (u_matrix * vec3(a_position, 1)).xy,
    0,
    1
  );

  // Multiply the point size twice:
  //  - x SCALING_RATIO to correct the canvas scaling
  //  - x 2 to correct the formulae
  gl_PointSize = a_size * u_ratio * u_scale * 2.0;

  v_border = (1.0 / u_ratio) * (0.5 / a_size);

  // Extract the color:
  v_color = a_color;
  v_color.a *= bias;
}
`
export default class CustomNodeProgram extends AbstractNodeProgram {
    // private innerNodeProgram: NodeFastProgram
    private outerNodeProgram: NodeFastProgram

    constructor(gl: WebGLRenderingContext) {
        super(gl, vertexShaderSource, fragmentShaderSource, POINTS, ATTRIBUTES);
        // this.innerNodeProgram = new NodeFastProgram(gl);
        this.outerNodeProgram = new NodeFastProgram(gl);
    }

    process(data: NodeDisplayData, hidden: boolean, offset: number): void {
        // @ts-ignore
        // const retainedSize: number | null = data.retainedSize;
        // this.outerNodeProgram.process({...data}, hidden, offset);
        // if (retainedSize !== null) {
        //     this.innerNodeProgram.process({
        //         ...data,
        //         size: retainedSize
        //     }, hidden, offset);
        // }
        const array = this.array;
        let i = offset * POINTS * ATTRIBUTES;

        if (hidden) {
            array[i++] = 0;
            array[i++] = 0;
            array[i++] = 0;
            array[i++] = 0;

            array[i++] = 0;
            array[i++] = 0;
            array[i++] = 0;
            array[i++] = 0;
            return;
        }

        const color = floatColor(data.color);
        array[i++] = data.x;
        array[i++] = data.y;
        array[i++] = data.size;
        array[i++] = color;
        console.log(data.shallowSize, data.size, data)

        array[i++] = data.x;
        array[i++] = data.y;
        array[i++] = data.shallowSize * (data.size / data.retainedSize);
        array[i++] = floatColor("#000");


    }

    render(params: RenderParams): void {
        // this.innerNodeProgram.render(params);
        // this.outerNodeProgram.render(params);
        const gl = this.gl;

        const program = this.program;
        gl.useProgram(program);

        gl.uniform1f(this.ratioLocation, 1 / Math.sqrt(params.ratio));
        gl.uniform1f(this.scaleLocation, params.scalingRatio);
        gl.uniformMatrix3fv(this.matrixLocation, false, params.matrix);

        gl.drawArrays(gl.POINTS, 0, this.array.length / ATTRIBUTES * 2);
    }

}