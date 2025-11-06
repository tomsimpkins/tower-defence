import chroma from "chroma-js";
import { aStarSearch, octileDistance } from "./aStarSearch";
import { makeElevationMap } from "./elevation";
import { mulberry32, rand } from "../mulberry32";
import { idFromPoint, type Point } from "../point";
import type { World } from "../world";

// Row-major index helper
const IDX = (w: number, x: number, y: number) => y * w + x;

/**
 * Convert a scalar elevation field to contour tangents.
 * elevation: Float32Array of length w*h (row-major), values arbitrary (e.g., [0,1]).
 * Returns unit vectors (tx, ty) of same length; each points along the local contour.
 */
export function elevationToTangents(
	elevation: number[],
	w: number,
	h: number,
): { tx: number[]; ty: number[] } {
	const tx = Array.from({ length: w * h }, () => 0);
	const ty = Array.from({ length: w * h }, () => 0);

	for (let y = 0; y < h; y++) {
		const y0 = y > 0 ? y - 1 : 0;
		const y1 = y < h - 1 ? y + 1 : h - 1;

		for (let x = 0; x < w; x++) {
			const x0 = x > 0 ? x - 1 : 0;
			const x1 = x < w - 1 ? x + 1 : w - 1;

			// Central differences (clamped on edges)
			const ddx = (elevation[IDX(w, x1, y)] - elevation[IDX(w, x0, y)]) * 0.5;
			const ddy = (elevation[IDX(w, x, y1)] - elevation[IDX(w, x, y0)]) * 0.5;

			// Tangent = gradient rotated +90° : (tx, ty) = (-∂E/∂y, ∂E/∂x)
			let vx = -ddy;
			let vy = ddx;

			// Normalize (fall back to (1,0) if the gradient is ~zero)
			const m = Math.hypot(vx, vy);
			if (m > 1e-12) {
				vx /= m;
				vy /= m;
			} else {
				vx = 1;
				vy = 0;
			}

			const i = IDX(w, x, y);
			tx[i] = vx;
			ty[i] = vy;
		}
	}

	return { tx, ty };
}

export const makeMap = (rand: () => number, w: number, h: number) => {
	const elevations = makeElevationMap(rand, w, h);
	const tangents = elevationToTangents(elevations, w, h);
	const stepCost = (p1: Point, p2: Point) => {
		const id1 = idFromPoint(w, p1);
		const id2 = idFromPoint(w, p2);

		const ux = p2.x - p1.x;
		const uy = p2.y - p1.y;

		const i = idFromPoint(w, p2);
		const txi = tangents.tx[i];
		const tyi = tangents.ty[i];
		const align = Math.abs(ux * txi + uy * tyi);

		const e1 = elevations[id1];
		const e2 = elevations[id2];

		return octileDistance(p1, p2) * (1 - 0.7 * align);
	};

	const path = aStarSearch(
		{ w, h },
		{ x: 0, y: 0 },
		{ x: w - 1, y: h - 1 },
		stepCost,
		() => 0,
	);

	return { elevations, path };
};

const W = 200;
const H = 200;
const cellRenderSize = 5;
const map = makeMap(rand, W, H);
export const renderMap = (world: World, ctx: CanvasRenderingContext2D) => {
	for (let r = 0; r < H; r++) {
		for (let c = 0; c < W; c++) {
			ctx.globalAlpha = map.elevations[idFromPoint(W, { x: c, y: r })];
			ctx.fillRect(
				c * cellRenderSize,
				r * cellRenderSize,
				cellRenderSize,
				cellRenderSize,
			);
			ctx.fill();
			ctx.globalAlpha = 1;
		}
	}

	const pathPoints = map.path ?? [];
	if (pathPoints.length > 0) {
		const previousFillStyle = ctx.fillStyle;
		const hueStep = 360 / pathPoints.length;
		for (let i = 0; i < pathPoints.length; i++) {
			const { x, y } = pathPoints[i];
			ctx.fillStyle = chroma.hsl((i * hueStep) % 360, 1, 0.5).hex();
			ctx.fillRect(
				x * cellRenderSize,
				y * cellRenderSize,
				cellRenderSize,
				cellRenderSize,
			);
			ctx.fill();
		}
		ctx.fillStyle = previousFillStyle;
	}
};
