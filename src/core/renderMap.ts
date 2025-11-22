import { CELL_SIZE, GRID_HEIGHT, GRID_WIDTH } from "../globals";
import type { Any2DCanvasContext } from "../render/canvasUtils";
import { makeTowerPalette } from "../render/makeTowerPalette";
import { rand } from "./mulberry32";
import { pointFromId } from "./point";
import { waveFunctionCollapse } from "./waveFunctionCollapse";

import type { World } from "./world";

type Grid = { w: number; h: number };
export const grid: Grid = { w: GRID_WIDTH, h: GRID_HEIGHT };
export const cells = waveFunctionCollapse(rand, grid);

// Dystopian / cyberfuture palette
const HULL_BASE = "#1b1d22"; // very dark
const PLATE = "#262b33"; // base plate
const PLATE_2 = "#2e3440"; // subtle variant
const GROOVE = "#0f1114"; // deep trench
const EDGE = "#424856"; // panel edges/highlights
const LIGHT = "#8fa3b8"; // small lit details

export const drawPoly = (
	ctx: Any2DCanvasContext,
	points: [number, number][],
) => {
	if (points.length === 0) {
		return;
	}

	const [start, ...rest] = points;
	const path = new Path2D();
	path.moveTo(...start);
	for (const pt of rest) {
		path.lineTo(...pt);
	}
	path.closePath();
	ctx.fill(path);
};
export const edgePoints = (
	edgeIndex: number,
	x: number,
	y: number,
	w: number,
	h: number,
) => {
	const ms = midPoints(x, y, w, h);
	const cs = corners(x, y, w, h);

	return [
		cs[edgeIndex],
		cs[(edgeIndex + 1) % 4],
		ms[(edgeIndex + 1) % 4],
		ms[(edgeIndex + 3) % 4],
	];
};

export const diagPoints = (
	cornerIndex: number,
	x: number,
	y: number,
	w: number,
	h: number,
) => {
	const ms = midPoints(x, y, w, h);
	const cs = corners(x, y, w, h);

	return [
		cs[cornerIndex],
		ms[cornerIndex],
		ms[(cornerIndex + 1) % 4],
		cs[(cornerIndex + 2) % 4],
		ms[(cornerIndex + 2) % 4],
		ms[(cornerIndex + 3) % 4],
	];
};

// const renderers2: Renderer[] = [
// 	// none
// 	(ctx, x, y, w, h) => {},
// 	// TL
// 	(ctx, x, y, w, h) => {
// 		const cs = cornerPoints(0, x, y, w, h);
// 		drawPoly(ctx, cs);
// 	},
// 	// TR
// 	(ctx, x, y, w, h) => {
// 		const cs = cornerPoints(1, x, y, w, h);
// 		drawPoly(ctx, cs);
// 	},
// 	// TL | TR,
// 	(ctx, x, y, w, h) => {
// 		const es = edgePoints(0, x, y, w, h);
// 		drawPoly(ctx, es);
// 	},
// 	// BL
// 	(ctx, x, y, w, h) => {
// 		const cs = cornerPoints(3, x, y, w, h);
// 		drawPoly(ctx, cs);
// 	},
// 	// TL | BL,
// 	(ctx, x, y, w, h) => {
// 		const es = edgePoints(3, x, y, w, h);
// 		drawPoly(ctx, es);
// 	},
// 	// TR | BL,
// 	(ctx, x, y, w, h) => {
// 		const ds = diagPoints(1, x, y, w, h);
// 		drawPoly(ctx, ds);
// 	},
// 	// TL | TR | BL,
// 	(ctx, x, y, w, h) => {
// 		const ics = inverseCornerPoints(2, x, y, w, h);
// 		drawPoly(ctx, ics);
// 	},
// 	// BR,
// 	(ctx, x, y, w, h) => {
// 		const cs = cornerPoints(2, x, y, w, h);
// 		drawPoly(ctx, cs);
// 	},
// 	// TL | BR,
// 	(ctx, x, y, w, h) => {
// 		const ds = diagPoints(0, x, y, w, h);
// 		drawPoly(ctx, ds);
// 	},
// 	// TR | BR,
// 	(ctx, x, y, w, h) => {
// 		const es = edgePoints(1, x, y, w, h);
// 		drawPoly(ctx, es);
// 	},
// 	// TL | TR | BR,
// 	(ctx, x, y, w, h) => {
// 		const ics = inverseCornerPoints(3, x, y, w, h);
// 		drawPoly(ctx, ics);
// 	},
// 	// BL | BR,
// 	(ctx, x, y, w, h) => {
// 		const es = edgePoints(2, x, y, w, h);
// 		drawPoly(ctx, es);
// 	},
// 	// TL | BL | BR,
// 	(ctx, x, y, w, h) => {
// 		const ics = inverseCornerPoints(1, x, y, w, h);
// 		drawPoly(ctx, ics);
// 	},
// 	// TR | BL | BR,
// 	(ctx, x, y, w, h) => {
// 		const ics = inverseCornerPoints(0, x, y, w, h);
// 		drawPoly(ctx, ics);
// 	},
// 	// TL | TR | BL | BR
// 	(ctx, x, y, w, h) => {
// 		drawPoly(ctx, corners(x, y, w, h));
// 	},
// ];
export const drawPanelBase = (
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	w: number,
	h: number,
	r: () => number,
) => {
	// base hull
	ctx.fillStyle = HULL_BASE;
	ctx.fillRect(x, y, w, h);

	// main plate
	fillPath(ctx, insetRect(x, y, w, h, Math.max(1, (w / 20) | 0)), PLATE);

	// a secondary inset plate (randomized)
	if (r() > 0.3) {
		const pad = Math.max(2, (w / 8) | 0);
		const pts = insetRect(x, y, w, h, pad);
		fillPath(ctx, pts, PLATE_2);
		strokePath(ctx, pts, EDGE, Math.max(1, (w / 40) | 0));
	}

	// a couple of tiny greebles
	const n = 1 + ((r() * 3) | 0);
	for (let i = 0; i < n; i++) {
		const gw = Math.max(2, (w / 6) | 0);
		const gh = Math.max(1, (h / 12) | 0);
		const gx = x + ((r() * (w - gw)) | 0);
		const gy = y + ((r() * (h - gh)) | 0);
		ctx.fillStyle = r() > 0.8 ? LIGHT : EDGE;
		ctx.fillRect(gx, gy, gw, gh);
	}
};
export const strokePath = (
	ctx: Any2DCanvasContext,
	pts: [number, number][],
	color: string,
	lw: number,
	dash?: number[],
) => {
	const path = buildPath(pts);
	ctx.strokeStyle = color;
	ctx.lineWidth = lw;
	if (dash) ctx.setLineDash(dash);
	else ctx.setLineDash([]);
	ctx.lineJoin = "bevel";
	ctx.lineCap = "butt";
	ctx.stroke(path);
};
export const drawTrench = (
	ctx: Any2DCanvasContext,
	pts: [number, number][],
	w: number,
) => {
	// recessed area: fill dark, then inner highlight edge
	fillPath(ctx, pts, GROOVE);
	strokePath(ctx, pts, EDGE, Math.max(1, w / 50));
};
export const trenchCorner = (
	ctx: Any2DCanvasContext,
	cornerIndex: number,
	x: number,
	y: number,
	w: number,
	h: number,
) => {
	const pad = Math.max(2, (w / 10) | 0);
	// shrink the corner triangle a bit so it reads like a channel cut
	const tri = cornerPoints(
		cornerIndex,
		x + pad,
		y + pad,
		w - 2 * pad,
		h - 2 * pad,
	);
	drawTrench(ctx, tri, w);
};
export const trenchEdge = (
	ctx: Any2DCanvasContext,
	edgeIndex: number,
	x: number,
	y: number,
	w: number,
	h: number,
) => {
	const pad = Math.max(2, (w / 10) | 0);
	const poly = edgePoints(
		edgeIndex,
		x + pad,
		y + pad,
		w - 2 * pad,
		h - 2 * pad,
	);
	drawTrench(ctx, poly, w);
};
export const trenchDiag = (
	ctx: Any2DCanvasContext,
	cornerIndex: number,
	x: number,
	y: number,
	w: number,
	h: number,
) => {
	const pad = Math.max(2, (w / 10) | 0);
	const poly = diagPoints(
		cornerIndex,
		x + pad,
		y + pad,
		w - 2 * pad,
		h - 2 * pad,
	);
	drawTrench(ctx, poly, w);
};
export const trenchInverseCorner = (
	ctx: Any2DCanvasContext,
	cornerIndex: number,
	x: number,
	y: number,
	w: number,
	h: number,
) => {
	const pad = Math.max(2, (w / 10) | 0);
	const poly = inverseCornerPoints(
		cornerIndex,
		x + pad,
		y + pad,
		w - 2 * pad,
		h - 2 * pad,
	);
	drawTrench(ctx, poly, w);
};
export const fillPath = (
	ctx: Any2DCanvasContext,
	pts: [number, number][],
	color: string,
) => {
	const path = buildPath(pts);
	ctx.fillStyle = color;
	ctx.fill(path);
};

export const drawToOffscreen = (ctx: Any2DCanvasContext) => {
	for (let i = 0; i < cells.length; i++) {
		const cell = cells[i];
		const { x, y } = pointFromId(grid.w, i);
		const [tile] = cell.available;
		renderers[tile]?.(ctx, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
	}
};

// --- selection helpers -------------------------------------------------------
function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

function drawSelectRing(
	ctx: Any2DCanvasContext,
	cx: number,
	cy: number,
	r: number,
	team: string,
	palette: ReturnType<typeof makeTowerPalette>,
	t: number,
) {
	// rotating arc + faint full ring
	const rot = (t * 0.006) % (Math.PI * 2); // ~1 rev / ~1.7s
	const sweep = Math.PI * 0.85;

	// faint base ring
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.strokeStyle = palette.ringStroke;
	ctx.globalAlpha = 0.35;
	ctx.lineWidth = Math.max(1, r / 5);
	ctx.stroke();

	// bright team arc
	ctx.beginPath();
	ctx.arc(cx, cy, r, rot, rot + sweep);
	ctx.strokeStyle = team;
	ctx.globalAlpha = 0.95;
	ctx.lineWidth = Math.max(2, r / 4);
	ctx.lineCap = "butt";
	ctx.setLineDash([]);
	ctx.stroke();

	ctx.globalAlpha = 1;
}

function pulseHalo(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	w: number,
	h: number,
	team: string,
	t: number,
) {
	// simple alpha pulse 0.08..0.18
	const a = lerp(0.08, 0.18, (Math.sin(t * 0.008) + 1) / 2);
	ctx.save();
	ctx.shadowColor = team.replace("rgb", "rgba").replace(")", `,${a})`);
	ctx.shadowBlur = Math.max(6, Math.min(w, h) / 8);
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	const p = new Path2D();
	p.rect(x + 2, y + 2, w - 4, h - 4);
	ctx.fillStyle = "transparent";
	ctx.fill(p);
	ctx.restore();
}

export const insetRect = (
	x: number,
	y: number,
	w: number,
	h: number,
	pad: number,
) =>
	[
		[x + pad, y + pad],
		[x + w - pad, y + pad],
		[x + w - pad, y + h - pad],
		[x + pad, y + h - pad],
	] as [number, number][];
// helpers

export const buildPath = (pts: [number, number][]) => {
	const p = new Path2D();
	if (!pts.length) return p;
	p.moveTo(pts[0]![0], pts[0]![1]);
	for (let i = 1; i < pts.length; i++) p.lineTo(pts[i]![0], pts[i]![1]);
	p.closePath();
	return p;
};
// --- RENDERERS: mask order 0..15 matching your existing array ---

export const renderers: Renderer[] = [
	// 0: none (just plates & greebles)
	(ctx, x, y, w, h) => {
		const r = seed32(x | 0, y | 0);
		drawPanelBase(ctx, x, y, w, h, r);
	},

	// 1: TL trench
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchCorner(ctx, 0, x, y, w, h);
	},

	// 2: TR trench
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchCorner(ctx, 1, x, y, w, h);
	},

	// 3: TL | TR -> top edge trench
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchEdge(ctx, 0, x, y, w, h);
	},

	// 4: BL trench
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchCorner(ctx, 3, x, y, w, h);
	},

	// 5: TL | BL -> left edge trench
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchEdge(ctx, 3, x, y, w, h);
	},

	// 6: TR | BL -> diagonal trench (TR to BL)
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchDiag(ctx, 1, x, y, w, h);
	},

	// 7: TL | TR | BL -> inverse-corner (missing BR)
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchInverseCorner(ctx, 2, x, y, w, h);
	},

	// 8: BR trench
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchCorner(ctx, 2, x, y, w, h);
	},

	// 9: TL | BR -> diagonal trench (TL to BR)
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchDiag(ctx, 0, x, y, w, h);
	},

	// 10: TR | BR -> right edge trench
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchEdge(ctx, 1, x, y, w, h);
	},

	// 11: TL | TR | BR -> inverse-corner (missing BL)
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchInverseCorner(ctx, 3, x, y, w, h);
	},

	// 12: BL | BR -> bottom edge trench
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchEdge(ctx, 2, x, y, w, h);
	},

	// 13: TL | BL | BR -> inverse-corner (missing TR)
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchInverseCorner(ctx, 1, x, y, w, h);
	},

	// 14: TR | BL | BR -> inverse-corner (missing TL)
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		trenchInverseCorner(ctx, 0, x, y, w, h);
	},

	// 15: TL | TR | BL | BR -> full recess (big cut)
	(ctx, x, y, w, h) => {
		const r = seed32(x, y);
		drawPanelBase(ctx, x, y, w, h, r);
		// entire tile is a recessed trench
		const pad = Math.max(2, (w / 10) | 0);
		const full = insetRect(x, y, w, h, pad);
		drawTrench(ctx, full, w);
	},
];
export const inverseCornerPoints = (
	cornerIndex: number,
	x: number,
	y: number,
	w: number,
	h: number,
) => {
	const ms = midPoints(x, y, w, h);
	const cs = corners(x, y, w, h);

	return [
		ms[cornerIndex % 4],
		cs[(cornerIndex + 1) % 4],
		ms[(cornerIndex + 1) % 4],
		cs[(cornerIndex + 2) % 4],
		ms[(cornerIndex + 2) % 4],
		cs[(cornerIndex + 3) % 4],
		ms[(cornerIndex + 3) % 4],
	];
};
export const cornerPoints = (
	cornerIndex: number,
	x: number,
	y: number,
	w: number,
	h: number,
) => {
	const ms = midPoints(x, y, w, h);
	const cs = corners(x, y, w, h);

	return [cs[cornerIndex], ms[cornerIndex], ms[(cornerIndex + 3) % 4]];
};
export const midPoints = (
	x: number,
	y: number,
	w: number,
	h: number,
): [number, number][] => {
	return [
		[x + w / 2, y],
		[x + w, y + h / 2],
		[x + w / 2, y + h],
		[x, y + h / 2],
	];
};
export const corners = (
	x: number,
	y: number,
	w: number,
	h: number,
): [number, number][] => {
	return [
		[x, y],
		[x + w, y],
		[x + w, y + h],
		[x, y + h],
	];
};
export type Renderer = (
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	w: number,
	h: number,
) => void;
// tiny deterministic RNG per cell (keeps details stable)
export const seed32 = (x: number, y: number) => {
	let s = (x * 73856093) ^ (y * 19349663) ^ 0x9e3779b9;
	s >>>= 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

export const renderMap = (() => {
	let offscreenCanvas: OffscreenCanvas | undefined = undefined;
	return (world: World, ctx: CanvasRenderingContext2D) => {
		if (!offscreenCanvas) {
			offscreenCanvas = new OffscreenCanvas(
				world.resource.map.width,
				world.resource.map.height,
			);

			const offscreenCtx = offscreenCanvas.getContext("2d")!;
			drawToOffscreen(offscreenCtx);
		}

		ctx.drawImage(offscreenCanvas, 0, 0);
		factoryBlock3x2(ctx, 3 * CELL_SIZE, 2 * CELL_SIZE, CELL_SIZE, CELL_SIZE, {
			t: world.resource.ui.wallTime,
		});
		reactorHub2x2(ctx, 2 * CELL_SIZE, 6 * CELL_SIZE, CELL_SIZE, CELL_SIZE, {
			t: world.resource.ui.wallTime,
		});
	};
})();

function ambientPerimeterTrack(
	ctx: Any2DCanvasContext,
	rect: [number, number][], // path from insetRect(...)
	team: string,
	palette: ReturnType<typeof makeTowerPalette>,
	t?: number,
) {
	const time =
		t ?? (typeof performance !== "undefined" ? performance.now() : 0);
	const path = buildPath(rect);

	// faint base outline for readability
	ctx.strokeStyle = palette.ringStroke;
	ctx.globalAlpha = 0.25;
	ctx.lineWidth = 1;
	ctx.setLineDash([]);
	ctx.stroke(path);

	// animated team “chase” along the perimeter
	ctx.strokeStyle = team;
	ctx.globalAlpha = 0.18; // subtle
	ctx.lineWidth = 2;
	const dash = 14; // dash length (px)
	const gap = 10; // gap (px)
	ctx.setLineDash([dash, gap]);
	// scroll the dash around the path
	ctx.lineDashOffset = -((time * 0.06) % (dash + gap)); // slow drift
	ctx.stroke(path);

	// cleanup
	ctx.globalAlpha = 1;
	ctx.setLineDash([]);
	ctx.lineDashOffset = 0;
}

// --- subtle ambient accent (always on) --------------------------------------
function ambientAccentRing(
	ctx: Any2DCanvasContext,
	cx: number,
	cy: number,
	r: number,
	team: string,
	palette: ReturnType<typeof makeTowerPalette>,
	t?: number,
) {
	const time =
		t ?? (typeof performance !== "undefined" ? performance.now() : 0);
	const rot = (time * 0.0012) % (Math.PI * 2); // slow: ~1 rev / ~5.2s
	const sweep = Math.PI * 0.55; // shorter, subtler arc

	// faint base ring (structure/readability)
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.strokeStyle = palette.ringStroke;
	ctx.globalAlpha = 0.25;
	ctx.lineWidth = Math.max(1, r / 6); // thin
	ctx.setLineDash([]);
	ctx.stroke();

	// soft team arc (very low alpha)
	ctx.beginPath();
	ctx.arc(cx, cy, r, rot, rot + sweep);
	ctx.strokeStyle = team;
	ctx.globalAlpha = 0.18;
	ctx.lineWidth = Math.max(1, r / 5);
	ctx.lineCap = "butt";
	// tiny feather: draw again slightly inside radius
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(cx, cy, r - 1, rot, rot + sweep);
	ctx.globalAlpha = 0.1;
	ctx.stroke();

	ctx.globalAlpha = 1;
}

// softer static halo (no pulse)
function faintHalo(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	w: number,
	h: number,
	palette: ReturnType<typeof makeTowerPalette>,
) {
	ctx.save();
	ctx.shadowColor = palette.highlight; // already low alpha in palette
	ctx.shadowBlur = Math.max(4, Math.min(w, h) / 12);
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	const p = new Path2D();
	p.rect(x + 2, y + 2, w - 4, h - 4);
	ctx.fillStyle = "transparent";
	ctx.fill(p);
	ctx.restore();
}

function buildingFrame(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	w: number,
	h: number,
	palette: ReturnType<typeof makeTowerPalette>,
) {
	// base slab
	ctx.fillStyle = palette.baseFill;
	ctx.fillRect(x, y, w, h);

	// inner plate
	const pad = Math.max(4, (Math.min(w, h) / 10) | 0);
	const inner = insetRect(x, y, w, h, pad);
	fillPath(ctx, inner, palette.innerFill);
	strokePath(ctx, inner, palette.baseStroke, Math.max(1, Math.min(w, h) / 80));

	// outer outline
	strokePath(ctx, insetRect(x, y, w, h, 1), palette.outline, 1);

	// subtle top highlight (like your turret top edge)
	const top = [
		[x + pad + 1, y + pad + 1],
		[x + w - pad - 1, y + pad + 1],
		[x + w - pad - 1, y + pad + 2],
		[x + pad + 1, y + pad + 2],
	] as [number, number][];
	strokePath(ctx, top, palette.highlight, 1);
}

function lightStuds(
	ctx: Any2DCanvasContext,
	pts: [number, number][],
	size: number,
	color: string,
) {
	ctx.fillStyle = color;
	for (const [sx, sy] of pts) {
		ctx.fillRect((sx - size / 2) | 0, (sy - size / 2) | 0, size, size);
	}
}
type BuildingOpts = {
	teamColor?: string;
	selected?: boolean;
	sizeMult?: number;
	palette?: ReturnType<typeof makeTowerPalette>;
	t?: number; // <-- NEW: animation time (e.g. performance.now())
};

export function reactorHub2x2(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	w: number,
	h: number,
	opts: {
		teamColor?: string;
		sizeMult?: number;
		palette?: ReturnType<typeof makeTowerPalette>;
		t?: number;
	} = {},
) {
	const cell = w;
	if (((x / cell) | 0) % 2 !== 0 || ((y / cell) | 0) % 2 !== 0) return;

	const palette = makeTowerPalette(opts.palette || {});
	const team = opts.teamColor ?? palette.gunAccent;
	const S = 2 * cell * (opts.sizeMult ?? 1);

	// base + frame
	faintHalo(ctx, x, y, S, S, palette);
	buildingFrame(ctx, x, y, S, S, palette);

	const cx = x + S / 2,
		cy = y + S / 2;

	// --- draw inner recess and dome first (so the ring won’t be covered) ---
	const pad1 = Math.max(6, (S / 12) | 0);
	const pad2 = pad1 + Math.max(4, (S / 24) | 0);
	drawTrench(ctx, insetRect(x, y, S, S, pad1), S);
	strokePath(
		ctx,
		insetRect(x, y, S, S, pad2),
		palette.innerStroke,
		Math.max(1, S / 120),
	);

	const domeR = Math.max(5, (S / 10) | 0);
	ctx.beginPath();
	ctx.arc(cx, cy, domeR + 2, 0, Math.PI * 2);
	ctx.fillStyle = palette.slitBg;
	ctx.fill();
	ctx.beginPath();
	ctx.arc(cx, cy, domeR, 0, Math.PI * 2);
	ctx.fillStyle = palette.innerFill;
	ctx.fill();
	ctx.strokeStyle = palette.outline;
	ctx.lineWidth = 1;
	ctx.stroke();

	// team pips
	const pip = Math.max(2, (S / 60) | 0);
	lightStuds(
		ctx,
		[
			[cx, y + pad1 + 2],
			[x + S - pad1 - 2, cy],
			[cx, y + S - pad1 - 2],
			[x + pad1 + 2, cy],
		],
		pip + 1,
		team,
	);

	// --- draw the subtle ambient ring last, slightly outside the dome ---
	const margin = Math.max(3, (S / 40) | 0);
	const ringR = domeR + margin; // make sure it clears the dome
	ambientAccentRing(ctx, cx, cy, ringR, team, palette, opts.t);
}

export function factoryBlock3x2(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	w: number,
	h: number,
	opts: {
		teamColor?: string;
		sizeMult?: number;
		palette?: ReturnType<typeof makeTowerPalette>;
		t?: number;
	} = {},
) {
	const cell = w;
	if (((x / cell) | 0) % 3 !== 0 || ((y / cell) | 0) % 2 !== 0) return;

	const palette = makeTowerPalette(opts.palette || {});
	const team = opts.teamColor ?? palette.gunAccent;

	const W = 3 * cell * (opts.sizeMult ?? 1);
	const H = 2 * cell * (opts.sizeMult ?? 1);

	faintHalo(ctx, x, y, W, H, palette);
	buildingFrame(ctx, x, y, W, H, palette);

	const pad1 = Math.max(6, (Math.min(W, H) / 10) | 0);
	const pad2 = pad1 + Math.max(4, (Math.min(W, H) / 16) | 0);

	const step1 = insetRect(x, y, W, H, pad1);
	const step2 = insetRect(x, y, W, H, pad2);

	// stepped tops
	fillPath(ctx, step1, palette.innerFill);
	strokePath(
		ctx,
		step1,
		palette.innerStroke,
		Math.max(1, Math.min(W, H) / 100),
	);

	fillPath(ctx, step2, palette.baseFill);
	strokePath(ctx, step2, palette.ringStroke, Math.max(1, Math.min(W, H) / 120));

	// 🔄 NEW: ambient perimeter track that hugs the inner step
	ambientPerimeterTrack(ctx, step2, team, palette, opts.t);

	// slits (unchanged)
	const slitW = Math.max(2, (Math.min(W, H) / 120) | 0);
	ctx.fillStyle = palette.highlight;
	ctx.fillRect(x + pad2 + 2, y + pad2 + 2, W - (pad2 + 2) * 2, slitW);
	ctx.fillRect(
		x + pad2 + 2,
		y + H - pad2 - 2 - slitW,
		W - (pad2 + 2) * 2,
		slitW,
	);

	// vents (unchanged)
	const ventX = x + (W * 2) / 3,
		ventY = y + H / 6,
		ventW = W / 3 - pad1,
		ventH = (2 * H) / 3;
	for (let i = 0; i < 4; i++) {
		const yy = ventY + (i + 1) * (ventH / 5);
		const p = Math.max(3, (W / 140) | 0);
		const vent = [
			[ventX + p, yy - 1],
			[ventX + ventW - p, yy - 1],
			[ventX + ventW - p, yy + 1],
			[ventX + p, yy + 1],
		] as [number, number][];
		fillPath(ctx, vent, palette.slitBg);
		strokePath(ctx, vent, palette.outline, 1);
	}

	// beacons (unchanged)
	const towerW = Math.max(12, (W / 10) | 0);
	const gap = Math.max(8, (W / 20) | 0);
	const tbx0 = x + pad2 + gap,
		tbx1 = tbx0 + towerW + gap,
		tby = y + pad2 + gap;
	const beaconSize = Math.max(3, (W / 100) | 0);
	lightStuds(
		ctx,
		[
			[tbx0 + towerW / 2, tby - 2],
			[tbx1 + towerW / 2, tby - 2],
		],
		beaconSize,
		team,
	);
}
