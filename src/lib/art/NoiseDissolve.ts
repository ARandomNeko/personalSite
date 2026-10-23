// A transition-only renderer. Settled surfaces return to native images or HTML.
// An integer quadtree reaches single framebuffer pixels and switches their source instantly.
import { quadtreeCursor, quadtreeTiming, type QuadtreeTiming } from './QuadtreeTiming';

const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * .5 + .5;
  gl_Position = vec4(a_position, 0., 1.);
}`;

const fragmentSource = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform sampler2D u_rank;
uniform vec2 u_viewport;
uniform vec2 u_fromPosition;
uniform vec2 u_toPosition;
uniform vec4 u_fromBounds;
uniform vec4 u_toBounds;
uniform float u_fromAspect;
uniform float u_toAspect;
uniform float u_progress;
uniform float u_cursor;

vec2 coverUV(vec2 uv, float aspect, vec2 position, vec2 viewport) {
  float screen = viewport.x / viewport.y;
  vec2 scale = vec2(min(screen / aspect, 1.), min(aspect / screen, 1.));
  return uv * scale + (1. - scale) * position;
}
vec4 surface(sampler2D source, float aspect, vec2 position, vec4 bounds) {
  vec2 uv = (v_uv - bounds.xy) / bounds.zw;
  if (any(lessThan(uv, vec2(0.))) || any(greaterThanEqual(uv, vec2(1.)))) return vec4(0.);
  return texture2D(source, coverUV(uv, aspect, position, u_viewport * bounds.zw));
}
void main() {
  if (u_progress <= 0.) {
    gl_FragColor = surface(u_from, u_fromAspect, u_fromPosition, u_fromBounds);
    return;
  }
  if (u_progress >= 1.) {
    gl_FragColor = surface(u_to, u_toAspect, u_toPosition, u_toBounds);
    return;
  }

  // Exactly one source per framebuffer pixel. No alpha blend, rotation, or UV distortion.
  vec2 packedTime = texture2D(u_rank, v_uv).rg;
  float switchAt = dot(packedTime, vec2(65280., 255.)) / 65535.;
  vec4 oldColor = surface(u_from, u_fromAspect, u_fromPosition, u_fromBounds);
  vec4 newColor = surface(u_to, u_toAspect, u_toPosition, u_toBounds);
  gl_FragColor = u_cursor >= switchAt ? newColor : oldColor;
}`;

// The quadtree is evaluated once, at drawing-buffer resolution. Resolved nodes can
// switch as blocks; every unresolved node subdivides until the terminal 1x1 pixel.
// RG stores a 16-bit switch time; BA stores terminal and resolving depth.
const fieldSource = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_viewport;
uniform vec2 u_seed;
float hash(vec2 p) {
  vec3 q = fract(vec3(p.x, p.y, p.x) * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
void main() {
  vec2 pixel = floor(v_uv * u_viewport);
  // A forest of bounded roots avoids switching a whole viewport-sized quadrant at the start.
  float rootSize = min(256., exp2(ceil(log2(max(2., max(u_viewport.x, u_viewport.y))))));
  float maxDepth = log2(rootSize);
  float size = rootSize;
  float depth = 0.;
  float path = .5;
  float switchAt = 1.;
  float resolved = 0.;
  float resolvedDepth = 0.;
  for (int level = 0; level < 16; level++) {
    size *= .5;
    depth = float(level) + 1.;
    vec2 node = floor(pixel / size);
    // Every level changes with the seed, but the schedule stays fixed while
    // playing: temporal randomness would make already-revealed pixels flicker.
    vec2 salt = u_seed + vec2(path * 19.19, depth * 7.7);
    float decision = hash(node + vec2(depth * 17.3, depth * 41.7) + salt);
    path = fract(path * .5 + .5 * decision);
    float chance = min(.75, .02 + .01 * depth * depth);
    if (resolved < .5 && (decision < chance || size <= 1.)) {
      float nodeTime = hash(node + vec2(73.9, depth * 23.7) + salt);
      float pixelTime = hash(pixel + u_seed.yx + vec2(path * 71.3, depth * 139.7));
      // Coarse branches release their pixels over a short window instead of
      // popping an entire 128px square in a single frame. The window contracts
      // with depth; source selection remains binary all the way to 1px leaves.
      float spread = .85 * pow(1. - (depth - 1.) / maxDepth, 2.);
      float timing = .01 + (.98 - spread) * nodeTime + spread * pixelTime;
      if (size <= 1.) {
        // A full-range rank: mixing two ranks would concentrate the population
        // in the middle and waste the end of the one-pixel stage.
        timing = pixelTime;
      }
      switchAt = (depth - 1. + timing) / maxDepth;
      resolvedDepth = depth;
      resolved = 1.;
    }
    // Keep tracing the hierarchy to the actual pixel; there are no 4px/2px terminal leaves.
    if (size <= 1.) break;
  }
  // Explicit packing, with GL dithering disabled, preserves all 65,536 buckets.
  float encodedTime = clamp(floor(switchAt * 65535. + .5), 1., 65534.);
  gl_FragColor = vec4(floor(encodedTime / 256.) / 255., mod(encodedTime, 256.) / 255.,
                      depth / 16., resolvedDepth / 16.);
}`;

export type DissolveFrame = {
	texture: WebGLTexture;
	aspect: number;
	position: [number, number];
	bounds?: [number, number, number, number];
};
type Frame = DissolveFrame;
type Surface = HTMLImageElement | HTMLCanvasElement;
export type DissolveClock = { started: number; timing: QuadtreeTiming };

export class NoiseDissolve {
	private gl: WebGLRenderingContext;
	private snapshotFormat: number;
	private program: WebGLProgram;
	private fieldProgram: WebGLProgram;
	private fieldTexture: WebGLTexture;
	private fieldBuffer: WebGLFramebuffer;
	private fieldViewport: WebGLUniformLocation | null;
	private fieldSeed: WebGLUniformLocation | null;
	private fieldWidth = 0;
	private fieldHeight = 0;
	private fieldRevision = -1;
	private revision = 0;
	private seed: [number, number] = [0, 0];
	private timing?: QuadtreeTiming;
	private buffer: WebGLBuffer;
	private uniforms: Record<string, WebGLUniformLocation | null>;
	private images = new Map<Surface, Frame>();
	private snapshots: WebGLTexture[] = [];
	private snapshotIndex = 0;
	private from?: Frame;
	private to?: Frame;
	private frame = 0;
	clock?: DissolveClock;
	private progress = 0;
	private done?: () => void;
	private active = false;
	private lost = false;

	constructor(
		private canvas: HTMLCanvasElement,
		private size: () => { width: number; height: number } = () => canvas.getBoundingClientRect(),
		transparent = false
	) {
		const gl = canvas.getContext('webgl', {
			alpha: transparent,
			premultipliedAlpha: false,
			antialias: false,
			depth: false,
			stencil: false,
			preserveDrawingBuffer: false,
			powerPreference: 'low-power'
		});
		if (!gl) throw new Error('WebGL unavailable');
		this.gl = gl;
		// WebGL1 rejects an RGBA copy from an opaque (RGB) default framebuffer.
		// Transparent card surfaces need RGBA; the painting background needs RGB.
		this.snapshotFormat = gl.getContextAttributes()!.alpha ? gl.RGBA : gl.RGB;
		// Rank bytes are data, not colors. Hardware dithering would corrupt them.
		gl.disable(gl.DITHER);
		const compile = (type: number, source: string) => {
			const shader = gl.createShader(type)!;
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				const error = gl.getShaderInfoLog(shader);
				gl.deleteShader(shader);
				throw new Error(error || 'Shader compilation failed');
			}
			return shader;
		};
		const vertex = compile(gl.VERTEX_SHADER, vertexSource);
		const link = (source: string) => {
			const fragment = compile(gl.FRAGMENT_SHADER, source);
			const program = gl.createProgram()!;
			gl.attachShader(program, vertex);
			gl.attachShader(program, fragment);
			gl.bindAttribLocation(program, 0, 'a_position');
			gl.linkProgram(program);
			gl.deleteShader(fragment);
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader link failed');
			return program;
		};
		this.program = link(fragmentSource);
		this.fieldProgram = link(fieldSource);
		gl.deleteShader(vertex);
		gl.useProgram(this.program);
		this.buffer = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const position = gl.getAttribLocation(this.program, 'a_position');
		gl.enableVertexAttribArray(position);
		gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
		this.uniforms = Object.fromEntries(
			[
				'from',
				'to',
				'rank',
				'viewport',
				'fromPosition',
				'toPosition',
				'fromBounds',
				'toBounds',
				'fromAspect',
				'toAspect',
				'progress',
				'cursor'
			].map((name) => [name, gl.getUniformLocation(this.program, `u_${name}`)])
		);
		gl.uniform1i(this.uniforms.from, 0);
		gl.uniform1i(this.uniforms.to, 1);
		gl.uniform1i(this.uniforms.rank, 2);
		this.fieldViewport = gl.getUniformLocation(this.fieldProgram, 'u_viewport');
		this.fieldSeed = gl.getUniformLocation(this.fieldProgram, 'u_seed');
		this.fieldTexture = this.texture();
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		this.fieldBuffer = gl.createFramebuffer()!;
		canvas.dataset.renderer = 'webgl';
		canvas.dataset.transition = 'quadtree';
		canvas.addEventListener('webglcontextlost', this.contextLost);
	}

	private contextLost = (event: Event) => {
		event.preventDefault();
		this.lost = true;
		const done = this.done;
		this.cancel();
		done?.();
	};

	private texture() {
		const gl = this.gl;
		const texture = gl.createTexture()!;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		return texture;
	}

	prepare(image: Surface): Frame {
		const cached = this.images.get(image);
		if (cached) return cached;
		const gl = this.gl;
		const width = image instanceof HTMLImageElement ? image.naturalWidth : image.width,
			height = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
		if (!width || !height) throw new Error('Image must be decoded before uploading');
		const maxSide = Math.min(2560, gl.getParameter(gl.MAX_TEXTURE_SIZE));
		const scale = Math.min(
			1,
			maxSide / Math.max(width, height),
			Math.sqrt(3_000_000 / (width * height))
		);
		const staging = document.createElement('canvas');
		staging.width = Math.max(1, Math.round(width * scale));
		staging.height = Math.max(1, Math.round(height * scale));
		const ctx = staging.getContext('2d')!;
		ctx.drawImage(image, 0, 0, staging.width, staging.height);
		const texture = this.texture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, staging);
		const position =
			image instanceof HTMLImageElement
				? (getComputedStyle(image).objectPosition || image.style.objectPosition || '50% 50%')
						.split(' ')
						.map((value) => {
							const percent = parseFloat(value);
							return Number.isFinite(percent) ? percent / 100 : 0.5;
						})
				: [0.5, 0.5];
		const result: Frame = {
			texture,
			aspect: width / height,
			position: [position[0] ?? 0.5, 1 - (position[1] ?? 0.5)]
		};
		this.images.set(image, result);
		// Three image textures cover the current scene and its immediate neighbors.
		for (const [key, value] of this.images) {
			if (this.images.size <= 3) break;
			if (value !== this.from && value !== this.to && key !== image) {
				gl.deleteTexture(value.texture);
				this.images.delete(key);
			}
		}
		return result;
	}

	// Keep the previous card visible while its next DOM snapshot is prepared.
	hold(source: Surface): boolean {
		if (this.lost) return false;
		if (this.active) return true;
		this.from = this.to = this.prepare(source);
		this.draw(0);
		this.canvas.style.visibility = 'visible';
		return true;
	}

	// Freeze before moving/resizing a local surface. The caller can place this
	// GPU snapshot in a larger transparent surface without a CPU readback.
	freeze(): Frame | undefined {
		if (this.lost || !this.from || !this.to || this.canvas.style.visibility !== 'visible') return;
		const gl = this.gl;
		this.draw(this.progress);
		this.snapshotIndex = 1 - this.snapshotIndex;
		const texture =
			this.snapshots[this.snapshotIndex] ?? (this.snapshots[this.snapshotIndex] = this.texture());
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.copyTexImage2D(
			gl.TEXTURE_2D,
			0,
			this.snapshotFormat,
			0,
			0,
			this.canvas.width,
			this.canvas.height,
			0
		);
		cancelAnimationFrame(this.frame);
		this.active = false;
		this.done = undefined;
		this.canvas.dataset.active = 'false';
		const captured: Frame = {
			texture,
			aspect: this.canvas.width / this.canvas.height,
			position: [0.5, 0.5]
		};
		this.from = this.to = captured;
		this.progress = 0;
		return captured;
	}

	play(
		from: Surface | Frame,
		to: Surface | Frame,
		done: () => void,
		clock?: DissolveClock
	): boolean {
		if (this.lost) return false;
		const toFrame = 'texture' in to ? to : this.prepare(to);
		const fromFrame = this.active ? this.freeze()! : 'texture' in from ? from : this.prepare(from);
		cancelAnimationFrame(this.frame);
		this.from = fromFrame;
		this.to = toFrame;
		// Snapshot before reseeding. Fresh browser entropy for every transition,
		// including the opening; the GPU expands it into a stable per-pixel schedule.
		const entropy = crypto.getRandomValues(new Uint32Array(2));
		this.seed = [entropy[0] / 4194304, entropy[1] / 4194304];
		this.revision++;
		this.clock = clock;
		this.done = done;
		this.active = true;
		this.canvas.style.visibility = 'visible';
		this.canvas.dataset.active = 'true';
		this.draw(0);
		// Preparing the field must not consume the opening's animation budget.
		this.clock ??= { started: performance.now(), timing: this.timing! };
		this.canvas.dataset.started = String(this.clock.started);
		this.canvas.dataset.duration = String(this.clock.timing.duration);
		this.frame = requestAnimationFrame(this.tick);
		return true;
	}

	private tick = (now: number) => {
		if (!this.active || this.lost) return;
		const progress = Math.max(
			0,
			Math.min(1, (now - this.clock!.started) / this.clock!.timing.duration)
		);
		this.draw(progress);
		if (progress < 1) this.frame = requestAnimationFrame(this.tick);
		else {
			const done = this.done;
			this.cancel();
			done?.();
		}
	};

	private prepareField(width: number, height: number) {
		if (
			width === this.fieldWidth &&
			height === this.fieldHeight &&
			this.revision === this.fieldRevision
		)
			return;
		const gl = this.gl;
		const resized = width !== this.fieldWidth || height !== this.fieldHeight;
		this.fieldWidth = width;
		this.fieldHeight = height;
		this.fieldRevision = this.revision;
		this.timing = quadtreeTiming(width, height);
		const w = Math.max(1, Math.ceil(width)),
			h = Math.max(1, Math.ceil(height));
		gl.bindTexture(gl.TEXTURE_2D, this.fieldTexture);
		if (resized) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fieldBuffer);
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			this.fieldTexture,
			0
		);
		gl.useProgram(this.fieldProgram);
		gl.uniform2f(this.fieldViewport, width, height);
		gl.uniform2f(this.fieldSeed, ...this.seed);
		gl.viewport(0, 0, w, h);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.useProgram(this.program);
	}

	private draw(progress: number) {
		const gl = this.gl;
		if (!this.from || !this.to) return;
		const { width, height } = this.size();
		// Use the actual display pixel grid for the terminal leaves, independently of CSS layout.
		const scale = devicePixelRatio || 1;
		const w = Math.max(1, Math.round(width * scale)),
			h = Math.max(1, Math.round(height * scale));
		if (this.canvas.width !== w || this.canvas.height !== h) {
			this.canvas.width = w;
			this.canvas.height = h;
		}
		this.prepareField(w, h);
		gl.viewport(0, 0, w, h);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.from.texture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.to.texture);
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, this.fieldTexture);
		gl.uniform2f(this.uniforms.viewport, w, h);
		gl.uniform1f(this.uniforms.fromAspect, this.from.aspect);
		gl.uniform1f(this.uniforms.toAspect, this.to.aspect);
		gl.uniform2f(this.uniforms.fromPosition, ...this.from.position);
		gl.uniform2f(this.uniforms.toPosition, ...this.to.position);
		gl.uniform4f(this.uniforms.fromBounds, ...(this.from.bounds ?? [0, 0, 1, 1]));
		gl.uniform4f(this.uniforms.toBounds, ...(this.to.bounds ?? [0, 0, 1, 1]));
		gl.uniform1f(this.uniforms.progress, progress);
		const { rootSize, stages } = this.timing!;
		const cursor = quadtreeCursor(progress, this.clock?.timing ?? this.timing!);
		const travel = Math.min(stages.length - 0.000001, cursor * stages.length);
		const depth = Math.floor(travel) + 1;
		gl.uniform1f(this.uniforms.cursor, cursor);
		this.canvas.dataset.cellSize = String(rootSize / 2 ** depth);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		this.progress = progress;
		this.canvas.dataset.progress = progress.toFixed(3);
	}

	cancel() {
		cancelAnimationFrame(this.frame);
		this.active = false;
		this.done = undefined;
		this.canvas.style.visibility = 'hidden';
		this.canvas.dataset.active = 'false';
	}

	destroy() {
		this.cancel();
		this.canvas.removeEventListener('webglcontextlost', this.contextLost);
		this.images.forEach((frame) => this.gl.deleteTexture(frame.texture));
		this.snapshots.forEach((texture) => this.gl.deleteTexture(texture));
		this.gl.deleteBuffer(this.buffer);
		this.gl.deleteProgram(this.program);
		this.gl.deleteProgram(this.fieldProgram);
		this.gl.deleteTexture(this.fieldTexture);
		this.gl.deleteFramebuffer(this.fieldBuffer);
	}
}
