export type Tile = number; // empty, TL, TR, TLTR,
export type Edge = number;

const corners: [number, number, number, number] = [1, 1 << 1, 1 << 2, 1 << 3];
export const [TL, TR, BL, BR] = corners;
export const allTiles: Tile[] = [
	0,
	TL,
	TR,
	TL | TR,
	BL,
	TL | BL,
	TR | BL,
	TL | TR | BL,
	BR,
	TL | BR,
	TR | BR,
	TL | TR | BR,
	BL | BR,
	TL | BL | BR,
	TR | BL | BR,
	TL | TR | BL | BR,
];

export const edges: [number, number, number, number] = [
	TL | TR,
	TR | BR,
	BL | BR,
	TL | BL,
];

export const [T, R, B, L] = edges;

const fourBits = (1 + 2 + 4 + 8) | 0;
export const clampFour = (n: number) => n & fourBits;

export const flipV = (n: number): number => {
	const [tl, tr, bl, br] = [n & TL, n & TR, n & BL, n & BR];
	return (tl << 2) | (tr << 2) | (bl >>> 2) | (br >>> 2);
};

export const flipH = (n: number): number => {
	const [tl, tr, bl, br] = [n & TL, n & TR, n & BL, n & BR];
	return (tl << 1) | (tr >>> 1) | (bl << 1) | (br >>> 1);
};

export const compatibleAtEdge = (
	tile1: number,
	edge1: number,
	tile2: number,
): boolean => {
	if (edge1 === T || edge1 === B) {
		return (tile1 & edge1) === flipV(tile2 & flipV(edge1));
	} else if (edge1 === R || edge1 === L) {
		return (tile1 & edge1) === flipH(tile2 & flipH(edge1));
	}

	throw new Error("Unrecognized edge " + edge1);
};
