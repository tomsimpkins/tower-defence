import { inBounds } from "./grid";
import { idFromPoint, type Point } from "./point";

type Grid = { w: number; h: number };

const DIRECTIONS: readonly Point[] = [
	{ x: 1, y: 0 },
	{ x: -1, y: 0 },
	{ x: 0, y: 1 },
	{ x: 0, y: -1 },
] as const;

const pointFromId = (w: number, id: number): Point => ({
	x: id % w,
	y: Math.floor(id / w),
});

// Bias knobs
const ADJACENT_CORRIDOR_WEIGHT = 0.25; // 0 < w ≤ 1; lower = stronger discouragement
const STRAIGHT_BONUS = 1.15; // ≥1; higher = stronger preference to continue straight

const carveMaze = (
	grid: Grid,
	startId: number,
	endId: number,
	rand: () => number,
): Int32Array => {
	const { w, h } = grid;
	const total = w * h;

	const parent = new Int32Array(total);
	parent.fill(-1);

	const visited = new Uint8Array(total);
	const stack: number[] = [startId];
	visited[startId] = 1;

	const pointFrom = (id: number) => ({ x: id % w, y: (id / w) | 0 });

	const weightedPick = (weights: number[], r: number): number => {
		let sum = 0;
		for (const w of weights) sum += w;
		if (sum === 0) return (r * weights.length) | 0; // fallback
		let t = r * sum;
		for (let i = 0; i < weights.length; i++) {
			t -= weights[i]!;
			if (t <= 0) return i;
		}
		return weights.length - 1;
	};

	while (stack.length > 0 && visited[endId] === 0) {
		const currentId = stack[stack.length - 1]!;
		const { x: cx, y: cy } = pointFrom(currentId);

		// Determine incoming direction (for straight-line bonus)
		let inDx = 0,
			inDy = 0;
		if (parent[currentId] !== -1) {
			const { x: px, y: py } = pointFrom(parent[currentId]!);
			inDx = cx - px;
			inDy = cy - py;
		}

		// Gather candidates + compute bias weights
		const candidates: number[] = [];
		const weights: number[] = [];

		for (const dir of DIRECTIONS) {
			const nx = cx + dir.x;
			const ny = cy + dir.y;
			if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
			const nid = nx + ny * w;
			if (visited[nid] !== 0) continue;

			// Count how many *side-adjacent* cells would touch a visited cell
			// relative to the corridor between (cx,cy) -> (nx,ny)
			const sideX1 = dir.y,
				sideY1 = -dir.x;
			const sideX2 = -dir.y,
				sideY2 = dir.x;

			let penalty = 0;

			// sides adjacent to current
			const c1x = cx + sideX1,
				c1y = cy + sideY1;
			if (c1x >= 0 && c1x < w && c1y >= 0 && c1y < h) {
				const sid = c1x + c1y * w;
				if (visited[sid] !== 0) penalty++;
			}
			const c2x = cx + sideX2,
				c2y = cy + sideY2;
			if (c2x >= 0 && c2x < w && c2y >= 0 && c2y < h) {
				const sid = c2x + c2y * w;
				if (visited[sid] !== 0) penalty++;
			}

			// sides adjacent to next
			const n1x = nx + sideX1,
				n1y = ny + sideY1;
			if (n1x >= 0 && n1x < w && n1y >= 0 && n1y < h) {
				const sid = n1x + n1y * w;
				if (visited[sid] !== 0) penalty++;
			}
			const n2x = nx + sideX2,
				n2y = ny + sideY2;
			if (n2x >= 0 && n2x < w && n2y >= 0 && n2y < h) {
				const sid = n2x + n2y * w;
				if (visited[sid] !== 0) penalty++;
			}

			// Base weight starts at 1, then apply discouragement for each side touch
			// e.g., penalty 0 => weight 1
			//       penalty k => weight *= ADJACENT_CORRIDOR_WEIGHT^k
			let weight = 1;
			if (penalty > 0) weight *= Math.pow(ADJACENT_CORRIDOR_WEIGHT, penalty);

			// Straight-line bonus (only if we have an incoming direction)
			if ((inDx !== 0 || inDy !== 0) && dir.x === inDx && dir.y === inDy) {
				weight *= STRAIGHT_BONUS;
			}

			candidates.push(nid);
			weights.push(weight);
		}

		if (candidates.length === 0) {
			stack.pop();
			continue;
		}

		// Weighted random choice
		const pick = weightedPick(weights, rand());
		const nextId = candidates[pick]!;
		parent[nextId] = currentId;
		visited[nextId] = 1;
		stack.push(nextId);
	}

	return parent;
};

export const randomWalk = (
	grid: Grid,
	start: Point,
	end: Point,
	rand: () => number,
): Point[] => {
	const { w, h } = grid;

	if (w <= 0 || h <= 0) return [];

	if (!inBounds(grid, start)) {
		throw new Error("randomWalk: start point out of bounds");
	}
	if (!inBounds(grid, end)) {
		throw new Error("randomWalk: end point out of bounds");
	}

	const startId = idFromPoint(w, start);
	const endId = idFromPoint(w, end);

	if (startId === endId) return [start];

	const parent = carveMaze(grid, startId, endId, rand);

	if (parent[endId] === -1) {
		// This should not happen now for a rectangular grid,
		// but keep the guard for safety.
		throw new Error(
			"randomWalk: generated maze does not connect start and end",
		);
	}

	// Reconstruct path from end → start via parents
	const path: Point[] = [];
	for (let id = endId; id !== -1; id = parent[id]!) {
		path.push(pointFromId(w, id));
		if (id === startId) break;
	}

	const last = path[path.length - 1];
	if (!last || last.x !== start.x || last.y !== start.y) {
		throw new Error("randomWalk: failed to trace path from maze");
	}

	path.reverse();
	return path;
};
