export type Point = { x: number; y: number };

export const addPoints = (p1: Point, p2: Point): Point => ({
	x: p1.x + p2.x,
	y: p1.y + p2.y,
});

export const equalPoints = (p1: Point, p2: Point): boolean =>
	p1.x === p2.x && p1.y === p2.y;

export const idFromPoint = (w: number, { x, y }: Point) => y * w + x;

export const pointFromId = (w: number, id: number): Point => ({
	x: id % w,
	y: Math.floor(id / w),
});

export const dot = (a: Point, b: Point) => {
	return a.x * b.x + a.y * b.y;
};

export const mag = (a: Point) => Math.sqrt(dot(a, a));

export const scale = (m: number, a: Point) => ({ x: a.x * m, y: a.y * m });

export const normal = (a: Point) => scale(1 / mag(a), a);

export const minus = (a: Point, b: Point): Point => ({
	x: a.x - b.x,
	y: a.y - b.y,
});
