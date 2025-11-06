import { CELL_SIZE } from "../globals";
import type { EntityId } from "./world";

export type Circle = { x: number; y: number; r: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type Point = { x: number; y: number };

const circleCellIndex = 0;
const rectCellIndex = 1;

export class HitTestMap {
	private cellSize: number;
	constructor(cellSize: number = CELL_SIZE) {
		this.cellSize = cellSize;
	}

	private rects: ({
		entityId: EntityId;
	} & Rect)[] = [];
	private circles: ({
		entityId: EntityId;
	} & Circle)[] = [];

	private cells: number[][][] = [];
	private cellForPoint = (x: number, y: number): [x: number, y: number] => {
		return [(x / this.cellSize) | 0, (y / this.cellSize) | 0];
	};

	private cellBounds = (
		x: number,
		y: number,
		w: number,
		h: number,
	): [x0: number, y0: number, x1: number, y1: number] => {
		const [x0, y0] = this.cellForPoint(x, y);
		const [x1, y1] = this.cellForPoint(x + w, y + h);

		return [x0, y0, x1, y1];
	};

	private getCell = (cellX: number, cellY: number): number[] => {
		const r = (this.cells[cellX] ??= []);
		const c = (r[cellY] ??= []);

		return c;
	};

	addRect(entityId: number, x: number, y: number, w: number, h: number) {
		const ri = this.rects.push({ entityId, x, y, w, h });

		const [x0, y0, x1, y1] = this.cellBounds(x, y, w, h);

		for (let cx = x0; cx <= x1; cx++) {
			for (let cy = y0; cy <= y1; cy++) {
				this.getCell(cx, cy).push(rectCellIndex, ri - 1);
			}
		}
	}

	addCircle(entityId: number, x: number, y: number, r: number) {
		const ci = this.circles.push({ entityId, x, y, r });

		const [x0, y0, x1, y1] = this.cellBounds(x - r, y - r, 2 * r, 2 * r);

		for (let cx = x0; cx <= x1; cx++) {
			for (let cy = y0; cy <= y1; cy++) {
				this.getCell(cx, cy).push(circleCellIndex, ci - 1);
			}
		}
	}

	private rectOnRectIntersect = (r1: Rect, r2: Rect): boolean => {
		const { x, y, w, h } = r1;
		const { x: xt, y: yt, w: wt, h: ht } = r2;

		return !(x + w <= xt || x >= xt + wt || y + h <= yt || y >= yt + ht);
	};

	private pointInRectIntersection = (p: Point, r: Rect): boolean => {
		return this.rectOnRectIntersect({ ...p, w: 0, h: 0 }, r);
	};

	private circleOnCircleIntersection = (c1: Circle, c2: Circle): boolean => {
		return Math.hypot(c1.x - c2.x, c1.y - c2.y) < c1.r + c2.r;
	};

	private pointInCircleIntersection = (p: Point, c: Circle): boolean => {
		return this.circleOnCircleIntersection({ ...p, r: 0 }, c);
	};

	private circleOnRectIntersection = (c: Circle, r: Rect): boolean => {
		// the circle centre is inside rectangle: intersect
		if (this.pointInRectIntersection({ x: c.x, y: c.y }, r)) {
			return true;
		}

		const { x: rx, y: ry, w: rw, h: rh } = r;
		const { x: cx, y: cy, r: cr } = c;
		// check cases when the circle centre is in a corner quadrant of the rectangle
		if (cx < rx && cy < ry) {
			return this.pointInCircleIntersection({ x: rx, y: ry }, c);
		} else if (cx < rx && cy > ry + rh) {
			return this.pointInCircleIntersection({ x: rx, y: ry + rh }, c);
		} else if (cx > rx + rw && cy < ry) {
			return this.pointInCircleIntersection({ x: rx + rw, y: ry }, c);
		} else if (cx > rx + rw && cy > ry + rh) {
			return this.pointInCircleIntersection({ x: rx + rw, y: ry + rh }, c);
		}

		// check cases when the circle centre is in a edge quadrant of the rectangle
		if (cx < rx) {
			return rx - cx < cr;
		} else if (cx > rx + rw) {
			return cx - (rx + rw) < cr;
		} else if (cy < ry) {
			return ry - cy < cr;
		} else if (cy > ry + rh) {
			return cy - (ry + rh) < cr;
		}

		return false;
	};

	intersectsRect(
		x: number,
		y: number,
		w: number,
		h: number,
	): EntityId | undefined {
		const [x0, y0, x1, y1] = this.cellBounds(x, y, w, h);
		for (let cx = x0; cx <= x1; cx++) {
			for (let cy = y0; cy <= y1; cy++) {
				const cell = this.getCell(cx, cy);

				for (let ci = 0; ci < cell.length; ci += 2) {
					const [type, index] = [cell[ci], cell[ci + 1]];
					switch (type) {
						case circleCellIndex: {
							const circle = this.circles[index];

							if (
								this.circleOnRectIntersection(circle, {
									x,
									y,
									w,
									h,
								})
							) {
								return circle.entityId;
							}
							break;
						}
						case rectCellIndex: {
							const rect = this.rects[index];
							if (this.rectOnRectIntersect(rect, { x, y, w, h })) {
								return rect.entityId;
							}
							break;
						}
					}
				}
			}
		}
	}

	clear() {
		this.rects = [];
		this.circles = [];
		this.cells = [];
	}
}
