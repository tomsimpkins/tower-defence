import { expect, test } from "bun:test";
import {
	clampFour,
	compatibleAtEdge,
	flipH,
	flipV,
	BL,
	BR,
	TL,
	TR,
	T,
	R,
	
	L,
} from "./tiles";

test("clampFour leaves values within the lowest four bits unchanged", () => {
	for (let value = 0; value < 16; value += 1) {
		expect(clampFour(value)).toBe(value);
	}
});

test("clampFour strips higher bits while preserving the lower four", () => {
	expect(clampFour(0b101010)).toBe(0b1010);
	expect(clampFour(-1)).toBe(0b1111);
});

test("flip swaps top and bottom corners while keeping columns", () => {
	expect(flipV(TL)).toBe(BL);
	expect(flipV(TR)).toBe(BR);
	expect(flipV(BL)).toBe(TL);
	expect(flipV(BR)).toBe(TR);
});

test("flip preserves combined corners and is its own inverse", () => {
	const original = TL | BR | TR;
	const flipped = flipV(original);

	expect(flipped).toBe(BL | TR | BR);
	expect(flipV(flipped)).toBe(original);
});

test("flipH swaps left and right corners while keeping rows", () => {
	expect(flipH(TL)).toBe(TR);
	expect(flipH(TR)).toBe(TL);
	expect(flipH(BL)).toBe(BR);
	expect(flipH(BR)).toBe(BL);

	const original = TL | BL | BR;
	const flipped = flipH(original);

	expect(flipped).toBe(TR | BR | BL);
	expect(flipH(flipped)).toBe(original);
});

test("compatibleAtEdge matches mirrored edges", () => {
	expect(compatibleAtEdge(TR, T, BR)).toBe(true);
	expect(compatibleAtEdge(TR, T, BL)).toBe(false);
	expect(compatibleAtEdge(TR | TL, T, BL)).toBe(false);

	expect(compatibleAtEdge(TL, L, TR)).toBe(true);
	expect(compatibleAtEdge(TL | BL | BR, L, TR | BR)).toBe(true);
	expect(compatibleAtEdge(TL, L, BR)).toBe(false);
	expect(compatibleAtEdge(TR | BR | BL, R, BL)).toBe(false);
});
