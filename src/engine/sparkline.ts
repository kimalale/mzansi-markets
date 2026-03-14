// ─────────────────────────────────────────────────────────
// Mzansi Markets — WebGL Sparkline Renderer
//
// Draws a 30-day price sparkline as a polyline using
// WebGL line primitives. Colour is green if end > start,
// red if end < start. Much crisper than Canvas 2D at
// small sizes.
// ─────────────────────────────────────────────────────────

import { TimeSeriesPoint } from '../services/api'

const VERT = `
attribute vec2 a_pos;
uniform vec2 u_res;
void main() {
  vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`
const FRAG = `
precision mediump float;
uniform vec3 u_color;
void main() { gl_FragColor = vec4(u_color, 1.0); }
`

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src); gl.compileShader(s)
  return s
}

export function drawSparkline(
  canvas: HTMLCanvasElement,
  points: TimeSeriesPoint[]
): void {
  if (points.length < 2) return

  const gl = canvas.getContext('webgl', { antialias: true, alpha: true })
  if (!gl) return

  const vs = compile(gl, gl.VERTEX_SHADER,   VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs); gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  gl.useProgram(prog)

  const W = canvas.width
  const H = canvas.height
  gl.viewport(0, 0, W, H)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const prices = points.map(p => p.close)
  const min    = Math.min(...prices)
  const max    = Math.max(...prices)
  const range  = max - min || 1
  const pad    = 6

  // Map to canvas coords
  const verts: number[] = []
  for (let i = 0; i < prices.length; i++) {
    const x = pad + (i / (prices.length - 1)) * (W - pad * 2)
    const y = H - pad - ((prices[i] - min) / range) * (H - pad * 2)
    verts.push(x, y)
  }

  const buf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)

  const aPos  = gl.getAttribLocation(prog, 'a_pos')
  const uRes  = gl.getUniformLocation(prog, 'u_res')
  const uCol  = gl.getUniformLocation(prog, 'u_color')

  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
  gl.uniform2f(uRes, W, H)

  const up = prices[prices.length - 1] >= prices[0]

  // Dim fill area under line
  const fillVerts: number[] = []
  for (let i = 0; i < prices.length; i++) {
    const x = pad + (i / (prices.length - 1)) * (W - pad * 2)
    const y = H - pad - ((prices[i] - min) / range) * (H - pad * 2)
    fillVerts.push(x, H - pad)
    fillVerts.push(x, y)
  }
  const fillBuf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, fillBuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fillVerts), gl.STATIC_DRAW)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
  gl.uniform2f(uRes, W, H)
  gl.uniform3f(uCol, ...(up ? [0.05, 0.35, 0.12] as [number,number,number] : [0.35, 0.05, 0.05] as [number,number,number]))
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, fillVerts.length / 2)

  // Main line
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
  gl.uniform3f(uCol, ...(up ? [0.25, 0.85, 0.45] as [number,number,number] : [0.88, 0.30, 0.30] as [number,number,number]))
  gl.lineWidth(1.5)
  gl.drawArrays(gl.LINE_STRIP, 0, verts.length / 2)

  // Start / end dots
  const dotVerts = [
    verts[0],                   verts[1],
    verts[verts.length - 2],   verts[verts.length - 1],
  ]
  const dotBuf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, dotBuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dotVerts), gl.STATIC_DRAW)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
  gl.uniform3f(uCol, 1, 1, 1)
  gl.drawArrays(gl.POINTS, 0, 2)
}
