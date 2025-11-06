import { CELL_SIZE, GRID_HEIGHT, GRID_WIDTH } from "../globals";
import type { Any2DCanvasContext } from "../render/canvasUtils";
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
	};
})();
