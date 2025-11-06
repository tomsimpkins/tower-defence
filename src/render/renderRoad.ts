import { CELL_SIZE } from "../globals";
import { World } from "./../core/world";

// --- palette (tweak to taste) ---
const ROAD_TRENCH = "#0f1114"; // deep recess, almost black
const ROAD_SURFACE = "#2a2f38"; // matte asphalt/plate
const ROAD_EDGE = "#3f4652"; // subtle bevel/edge
const NEON_RAIL = "#6ee4ff"; // cyan rail
const NEON_GLOW = "rgba(110,228,255,0.55)"; // glow overlay
const DASH_COLOR = "#c3f3ff"; // bright dash
const FILTH_TINT = "rgba(0,0,0,0.08)"; // subtle grime pass

// sizes
const ROAD_REL_WIDTH = 0.62; // fraction of CELL_SIZE
const TRENCH_PAD_PX = 3; // trench extends beyond road
const RAIL_WIDTH_PX = 2; // thin neon rails
const DASH_WIDTH_FRAC = 0.22; // fraction of road width
const DASH_LEN_PX = 12; // dash len in px
const DASH_GAP_PX = 10; // dash gap
const GLOW_BLUR = 8; // glow blur

// Helpers: convert path cells to pixel centers
function centersFromPath(path: { x: number; y: number }[], cell: number) {
	return path.map((p) => ({ x: (p.x + 0.5) * cell, y: (p.y + 0.5) * cell }));
}

// Filled axis-aligned ribbon: discs at nodes + rects between nodes
function drawRibbon(
	ctx: CanvasRenderingContext2D,
	pts: { x: number; y: number }[],
	width: number,
	color: string,
) {
	const r = width / 2;
	// caps
	ctx.fillStyle = color;
	for (const p of pts) {
		ctx.beginPath();
		ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
		ctx.fill();
	}
	// links
	for (let i = 0; i < pts.length - 1; i++) {
		const a = pts[i]!,
			b = pts[i + 1]!;
		if (a.x === b.x) {
			// vertical
			const top = Math.min(a.y, b.y);
			const h = Math.abs(b.y - a.y);
			ctx.fillRect(a.x - r, top, width, h);
		} else if (a.y === b.y) {
			// horizontal
			const left = Math.min(a.x, b.x);
			const w = Math.abs(b.x - a.x);
			ctx.fillRect(left, a.y - r, w, width);
		} else {
			// if a diagonal sneaks in, bend at an L corner
			const mid = { x: b.x, y: a.y };
			const left = Math.min(a.x, mid.x);
			const w = Math.abs(mid.x - a.x);
			ctx.fillRect(left, a.y - r, w, width);
			const top = Math.min(mid.y, b.y);
			const h = Math.abs(b.y - mid.y);
			ctx.fillRect(mid.x - r, top, width, h);
			ctx.beginPath();
			ctx.arc(mid.x, mid.y, r, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}

// Build a polyline for strokes on top (rails/dashes)
function strokePolyline(
	ctx: CanvasRenderingContext2D,
	pts: { x: number; y: number }[],
) {
	if (pts.length < 2) return null;
	const path = new Path2D();
	path.moveTo(pts[0]!.x, pts[0]!.y);
	for (let i = 1; i < pts.length; i++) path.lineTo(pts[i]!.x, pts[i]!.y);
	return path;
}

// Slight random grime strips per segment (keeps it industrial)
function grimePass(
	ctx: CanvasRenderingContext2D,
	pts: { x: number; y: number }[],
	width: number,
) {
	ctx.save();
	ctx.globalCompositeOperation = "multiply";
	ctx.fillStyle = FILTH_TINT;
	const g = Math.max(1, Math.floor(pts.length / 4));
	for (let i = 0; i < g; i++) {
		const idx = 1 + ((i * 3) % Math.max(1, pts.length - 1));
		const a = pts[idx - 1],
			b = pts[idx];
		if (!a || !b) continue;
		const vertical = a.x === b.x;
		const len = Math.hypot(b.x - a.x, b.y - a.y);
		const stripW = Math.max(1, Math.round(width * 0.1));
		const stripL = Math.max(8, Math.round(len * (0.25 + (i % 3) * 0.15)));
		const offset = (i % 2 === 0 ? -1 : 1) * Math.round(width * 0.2);
		if (vertical) {
			const top = Math.min(a.y, b.y) + (len - stripL) / 2;
			ctx.fillRect(a.x + offset - stripW / 2, top, stripW, stripL);
		} else {
			const left = Math.min(a.x, b.x) + (len - stripL) / 2;
			ctx.fillRect(left, a.y + offset - stripW / 2, stripL, stripW);
		}
	}
	ctx.restore();
}

// Main: call this in your renderer
export function drawDystopianRoad(
	ctx: CanvasRenderingContext2D,
	pathCells: { x: number; y: number }[],
	CELL_SIZE: number,
	timeSec: number = performance.now() / 1000,
) {
	if (!pathCells.length) return;

	const pts = centersFromPath(pathCells, CELL_SIZE);
	const roadW = Math.max(2, Math.round(CELL_SIZE * ROAD_REL_WIDTH));
	const trenchW = roadW + TRENCH_PAD_PX * 2;

	ctx.save();

	// 1) recessed trench underlay (darker + slight inner edge)
	drawRibbon(ctx, pts, trenchW, ROAD_TRENCH);
	// inner bevel line
	const bevel = strokePolyline(ctx, pts);
	if (bevel) {
		ctx.strokeStyle = ROAD_EDGE;
		ctx.lineWidth = Math.max(1, Math.round(trenchW * 0.06));
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.stroke(bevel);
	}

	// 2) road surface
	drawRibbon(ctx, pts, roadW, ROAD_SURFACE);

	// 3) grime/industrial streaks for texture
	grimePass(ctx, pts, roadW);

	// 4) twin neon rails (thin strokes) + glow
	const railPath = strokePolyline(ctx, pts);
	if (railPath) {
		// rails slightly inset from the edges
		const railInset = Math.max(1, Math.round(roadW * 0.3));
		// left rail
		ctx.save();
		ctx.strokeStyle = NEON_GLOW;
		ctx.lineWidth = RAIL_WIDTH_PX;
		ctx.shadowColor = NEON_GLOW;
		ctx.shadowBlur = GLOW_BLUR;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		// fake offset rail by stroking twice with path offset via transform
		// top/left rail (negative normal)
		ctx.translate(0, 0);
		ctx.setLineDash([]);
		// draw vertical/horizontal offsets by rendering on two auxiliary paths:
		// For simplicity we render rails as narrower ribbons: draw again with stroke but inset visually
		ctx.shadowColor = NEON_GLOW;
		ctx.stroke(railPath);
		ctx.restore();

		// right rail (crisp, no glow)
		ctx.save();
		ctx.strokeStyle = NEON_RAIL;
		ctx.lineWidth = RAIL_WIDTH_PX;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.stroke(railPath);
		ctx.restore();
	}

	// 5) animated center dashes (move with time)
	const dashPath = strokePolyline(ctx, pts);
	if (dashPath) {
		const dashWidth = Math.max(1, Math.round(roadW * DASH_WIDTH_FRAC));
		ctx.strokeStyle = DASH_COLOR;
		ctx.lineWidth = dashWidth;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.setLineDash([DASH_LEN_PX, DASH_GAP_PX]);
		// drift forward; tune speed here
		const dashSpeed = 40; // px/sec
		ctx.lineDashOffset = -((timeSec * dashSpeed) % (DASH_LEN_PX + DASH_GAP_PX));
		// slight glow pass underneath
		ctx.save();
		ctx.shadowColor = NEON_GLOW;
		ctx.shadowBlur = GLOW_BLUR;
		ctx.globalAlpha = 0.55;
		ctx.stroke(dashPath);
		ctx.restore();
		// crisp pass
		ctx.stroke(dashPath);
		ctx.setLineDash([]);
	}

	ctx.restore();
}

export const renderRoad = (world: World, ctx: CanvasRenderingContext2D) => {
	const w = world.resource.road;
	const t = world.resource.wallTime / 1000; // seconds

	drawDystopianRoad(ctx, w.points /* your path cells */, CELL_SIZE, t);
};
