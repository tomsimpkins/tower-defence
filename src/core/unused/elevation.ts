import { idFromPoint, pointFromId } from "../point";

// t in [0, 1]
const smoothstep = (t: number): number => t * t * (3 - 2 * t);

// t in [0, 1]
const linearInterpolation = (a: number, b: number, t: number): number =>
	a + (b - a) * t;

export const smoothNoise = (
	rand: () => number,
	w: number,
	h: number,
	cellSize: number,
): number[] => {
	const latticeWidth = Math.max(2, Math.floor(w / cellSize) + 2);
	const latticeHeight = Math.max(2, Math.floor(h / cellSize) + 2);
	const lattice = Array.from({ length: latticeHeight * latticeWidth }, () =>
		rand(),
	);

	const sample = (x: number, y: number) => {
		const lx = x / cellSize;
		const ly = y / cellSize;

		const lx0 = lx | 0;
		const lx1 = lx0 + 1;
		const ly0 = ly | 0;
		const ly1 = ly0 + 1;

		const l00 = idFromPoint(latticeWidth, { x: lx0, y: ly0 });
		const l10 = idFromPoint(latticeWidth, { x: lx1, y: ly0 });
		const l01 = idFromPoint(latticeWidth, { x: lx0, y: ly1 });
		const l11 = idFromPoint(latticeWidth, { x: lx1, y: ly1 });

		const fx = smoothstep(lx - lx0);
		const fy = smoothstep(ly - ly0);

		const v0 = linearInterpolation(lattice[l00], lattice[l10], fx);
		const v1 = linearInterpolation(
			lattice[l01],
			lattice[l11],
			smoothstep(lx - lx0),
		);
		return linearInterpolation(v0, v1, fy);
	};

	return Array.from({ length: w * h }, (_, i) => {
		const pt = pointFromId(w, i);
		return sample(pt.x, pt.y);
	});
};

type FBMOptions = {
	baseCellSize: number; // pixels per lattice cell at octave 0 (e.g., 28 → coarse)
	octaves: number; // 3–6 typical - layers of repeat
	lacunarity: number; // >1; how much cellSize shrinks per octave (≈2)
	gain: number; // 0..1; amplitude falloff per octave (≈0.5)
};

export const defaultFBMOptions: FBMOptions = {
	gain: 0.3,
	lacunarity: 1.3,
	baseCellSize: 50,
	octaves: 7,
};

export const fractalBrownianMotion = (
	rand: () => number,
	w: number,
	h: number,
	smoothNoise: (
		rand: () => number,
		w: number,
		h: number,
		cellSize: number,
	) => number[],
	options: FBMOptions = defaultFBMOptions,
): number[] => {
	const { gain, lacunarity, baseCellSize, octaves } = options;
	const result = Array.from({ length: w * h }, () => 0);
	let amplitude = 1;
	let cellSize = baseCellSize;
	let amplitudeSum = 0;

	for (let octave = 0; octave < octaves; octave++) {
		const layer = smoothNoise(rand, w, h, cellSize);
		for (let i = 0; i < layer.length; i++) {
			result[i] = layer[i];
		}

		amplitudeSum += amplitude;
		amplitude *= gain;
		cellSize = Math.max(1, cellSize / lacunarity);
	}

	for (let i = 0; i < result.length; i++) {
		result[i] /= amplitudeSum;
	}

	return result;
};

export const makeElevationMap = (rand: () => number, w: number, h: number) => {
	return fractalBrownianMotion(rand, w, h, smoothNoise, {
		...defaultFBMOptions,
		baseCellSize: w,
	});
};
