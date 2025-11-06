import { inBounds } from "./grid";
import { addPoints, idFromPoint, pointFromId, type Point } from "./point";
import { allTiles, compatibleAtEdge, edges, type Tile } from "./tiles";

type Grid = { w: number; h: number };

const deltas: Point[] = [
	{ x: 0, y: -1 },
	{ x: 1, y: 0 },
	{ x: 0, y: 1 },
	{ x: -1, y: 0 },
];

type OpenCell = {
	available: Tile[];
	state: "open";
};
type CollapsedCell = { available: [Tile]; state: "collapsed" };
type Cell = OpenCell | CollapsedCell;

const weights: Record<Tile, number> = {};

const pickWeighted = (
	rand: () => number,
	weights: Record<Tile, number>,
	options: Tile[],
) => {
	const cumulativeWeights = options.reduce<number[]>((cumulative, tile, i) => {
		const w = weights[tile] ?? 1;
		if (i === 0) cumulative.push(w);
		else cumulative.push(cumulative.at(-1)! + w);

		return cumulative;
	}, []);

	const t = rand() * cumulativeWeights.at(-1)!;
	const i = cumulativeWeights.findIndex((w) => t < w);

	return options[i];
};

const pickInt = (rand: () => number, min = 0, max = 1): number => {
	return (min + rand() * (max - min)) | 0;
};

// const isNonEmpty = <X>(xs: X[]): xs is NonEmptyArray<X> => xs.length > 0;

export const waveFunctionCollapse = (
	rand: () => number,
	grid: Grid,
): Cell[] => {
	const { w, h } = grid;
	const cells: Cell[] = Array.from({ length: w * h }, () => ({
		available: allTiles.slice(),
		state: "open",
	}));

	const chooseCell = (): number | undefined => {
		let candidates: number[] = [];

		let min = Infinity;
		for (let i = 0; i < cells.length; i++) {
			const cell = cells[i];
			if (cell.state !== "open") {
				continue;
			}

			const availableCount = cell.available.length;
			if (availableCount < min) {
				min = availableCount;
				candidates = [i];
			} else if (availableCount === min) {
				candidates.push(i);
			}
		}

		if (candidates.length) {
			const idx = pickInt(rand, 0, candidates.length);
			return candidates[idx];
		}

		return undefined;
	};

	const collapseCell = (i: number) => {
		const cell = cells[i];
		const chosenTile = pickWeighted(rand, weights, cell.available);

		cell.available = [chosenTile];
	};

	const markCellStates = () => {
		for (const cell of cells) {
			if (cell.available.length === 1) {
				cell.state = "collapsed";
			}
		}
	};

	const propagateCell = (i: number) => {
		const queue: number[] = [i];
		while (queue.length) {
			const j = queue.shift()!;
			const cell = cells[j];
			const point = pointFromId(w, j);

			for (const [i, d] of deltas.entries()) {
				const n = addPoints(point, d);
				if (!inBounds(grid, n)) {
					continue;
				}

				const nId = idFromPoint(w, n);
				const nCell = cells[nId];
				const edge = edges[i];
				const nNextAvailable = nCell.available.filter((nt) =>
					cell.available.some((ct) => compatibleAtEdge(ct, edge, nt)),
				);

				if (nNextAvailable.length === nCell.available.length) {
					continue;
				}

				nCell.available = nNextAvailable;
				queue.push(nId);
			}
		}
	};

	let itermax = 100_000;
	while (itermax--) {
		const i = chooseCell();
		if (i === undefined) {
			break;
		}

		collapseCell(i);
		propagateCell(i);
		markCellStates();
	}

	return cells;
};
