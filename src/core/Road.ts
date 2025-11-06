import { type Point, minus, equalPoints } from "./point";

export class Road {
	readonly points: Point[];
	readonly waypoints: Point[];
	constructor(points: Point[]) {
		if (points.length < 2) {
			throw new Error("Cannot have road with less than two points");
		}

		this.points = points;
		this.waypoints = this.calculateWaypoints();
	}

	private calculateWaypoints(): Point[] {
		const triples = <T>(xs: T[]): [T, T, T][] => {
			if (xs.length < 3) {
				return [];
			}

			const res: [T, T, T][] = [];
			for (let i = 0; i < xs.length - 2; i++) {
				const x1 = xs[i];
				const x2 = xs[i + 1];
				const x3 = xs[i + 2];
				res[i] = [x1, x2, x3];
			}

			return res;
		};

		const ts = triples(this.points).filter(([p1, p2, p3]) => {
			const p1ToP2 = minus(p2, p1);
			const p2ToP3 = minus(p3, p2);
			return !equalPoints(p1ToP2, p2ToP3);
		});

		return ts
			.map(([, corner]) => corner)
			.concat([this.points[this.points.length - 1]]);
	}
}
