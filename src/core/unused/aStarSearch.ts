import { inBounds } from "../grid";
import { MinPriorityQueue } from "./MinPriorityQueue";
import {
	addPoints,
	equalPoints,
	idFromPoint,
	pointFromId,
	type Point,
} from "../point";

const manhattanDistance = (p1: Point, p2: Point): number =>
	Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);

export const octileDistance = (p1: Point, p2: Point): number => {
	const dx = Math.abs(p1.x - p2.x);
	const dy = Math.abs(p1.y - p2.y);

	if (dx < dy) {
		// then diagonally in the direction of p2
		return dy - dx + Math.SQRT2 * dx;
	} else {
		return dx - dy + Math.SQRT2 * dy;
	}
};

type Grid = {
	w: number;
	h: number;
};

type NodeResult = {
	costSoFar: number;
	px: number;
	py: number;
	state: "unseen" | "open" | "closed";
};

const deltas: readonly Point[] = [
	{ x: 0, y: -1 },
	{ x: 0, y: 1 },
	{ x: 1, y: 0 },
	{ x: -1, y: 0 },
	{ x: 1, y: 1 },
	{ x: 1, y: -1 },
	{ x: -1, y: 1 },
	{ x: -1, y: -1 },
];
const getNeighbors = (point: Point): Point[] =>
	deltas.map((delta) => addPoints(delta, point));

type AStartQueueItem = { value: number; id: number };
export const aStarSearch = (
	grid: Grid,
	start: Point,
	end: Point,
	stepCost: (p1: Point, p2: Point) => number = octileDistance,
	estimateCost: (p1: Point, p2: Point) => number = octileDistance,
): Point[] | undefined => {
	const { w, h } = grid;
	if (!inBounds(grid, start) || !inBounds(grid, end)) {
		return undefined;
	}

	const nodeResults = Array.from<unknown, NodeResult>(
		{ length: w * h },
		() => ({
			costSoFar: Infinity,
			px: -1,
			py: -1,
			state: "unseen",
		}),
	);
	nodeResults[idFromPoint(w, start)] = {
		costSoFar: 0,
		px: -1,
		py: -1,
		state: "open",
	};

	const queue = new MinPriorityQueue<AStartQueueItem>();
	queue.push({ value: estimateCost(start, end), id: idFromPoint(w, start) });
	while (queue.length() > 0) {
		const current = queue.pop()!;
		const currentResult = nodeResults[current.id];
		if (currentResult.state === "closed") {
			continue;
		}
		currentResult.state = "closed";

		const currentPoint = pointFromId(w, current.id);
		if (equalPoints(currentPoint, end)) {
			break;
		}

		for (const n of getNeighbors(currentPoint)) {
			if (!inBounds(grid, n)) {
				continue;
			}

			const nId = idFromPoint(w, n);
			const nResult = nodeResults[nId];
			if (nResult.state === "closed") {
				continue;
			}

			const isDiagonal = manhattanDistance(currentPoint, n) > 1;
			if (isDiagonal) {
				const orthog1: Point = { x: currentPoint.x, y: n.y };
				const orthog2: Point = { x: n.x, y: currentPoint.y };

				const o1Id = idFromPoint(w, orthog1);
				const o2Id = idFromPoint(w, orthog2);

				if (
					nodeResults[o1Id].state === "closed" ||
					nodeResults[o2Id].state === "closed"
				) {
					continue;
				}
			}

			const tentativeCost = currentResult.costSoFar + stepCost(currentPoint, n);
			if (!Number.isFinite(tentativeCost)) {
				continue;
			}

			if (!(nResult.state === "unseen" || tentativeCost < nResult.costSoFar)) {
				continue;
			}

			const heuristicToEnd = estimateCost(n, end);
			nResult.costSoFar = tentativeCost;
			nResult.px = currentPoint.x;
			nResult.py = currentPoint.y;
			nResult.state = "open";

			queue.push({ id: nId, value: tentativeCost + heuristicToEnd });
		}
	}

	const endResult = nodeResults[idFromPoint(w, end)];
	if (endResult.state !== "closed") {
		return;
	}

	const path: Point[] = [];
	let point = end;
	let result = endResult;
	while (true) {
		path.push(point);
		if (equalPoints(point, start)) {
			break;
		}

		point = { x: result.px, y: result.py };
		result = nodeResults[idFromPoint(w, point)];
	}

	return path.reverse();
};
