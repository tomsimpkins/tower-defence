import { expect, test } from "bun:test";
import { aStarSearch } from "./aStarSearch";

test("finds straight path in a single-column grid", () => {
	const grid = { w: 1, h: 4 };
	const start = { x: 0, y: 0 };
	const end = { x: 0, y: 3 };

	expect(aStarSearch(grid, start, end)).toEqual([
		{ x: 0, y: 0 },
		{ x: 0, y: 1 },
		{ x: 0, y: 2 },
		{ x: 0, y: 3 },
	]);
});

test("prefers lower-cost detour over expensive direct path", () => {
	const grid = { w: 3, h: 3 };
	const start = { x: 0, y: 0 };
	const end = { x: 2, y: 0 };

	const weights = [
		[0, 100, 1],
		[1, 1, 1],
		[1, 1, 1],
	];
	const stepCost = (
		_from: { x: number; y: number },
		to: { x: number; y: number },
	) => weights[to.y]?.[to.x] ?? Number.POSITIVE_INFINITY;

	expect(aStarSearch(grid, start, end, stepCost)).toEqual([
		{ x: 0, y: 0 },
		{ x: 0, y: 1 },
		{ x: 1, y: 1 },
		{ x: 2, y: 1 },
		{ x: 2, y: 0 },
	]);
});

test("returns undefined when start or end is outside the grid", () => {
	const grid = { w: 2, h: 2 };

	expect(aStarSearch(grid, { x: -1, y: 0 }, { x: 1, y: 1 })).toBeUndefined();
	expect(aStarSearch(grid, { x: 0, y: 0 }, { x: 2, y: 0 })).toBeUndefined();
});
