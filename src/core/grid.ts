import type { Point } from "./point";

export const inBounds = (
	grid: { w: number; h: number },
	pt: Point,
): boolean => {
	const { w, h } = grid;
	const { x, y } = pt;
	return x >= 0 && x < w && y >= 0 && y < h;
};
