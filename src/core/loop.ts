import { World } from "./world";

const FIXED_DT_MS = 1000 / 60; // timeslice for 60 fps: milliseconds per frame
const FIXED_DT_S = FIXED_DT_MS / 1000;

export const startLoop = (world: World, render: (world: World) => void) => {
	let last = performance.now();
	let acc = 0;

	const loop = (now: number) => {
		world.resource.ui.wallTime = now;

		acc += now - last;
		last = now;
		if (acc > 500) acc = 500;
		while (acc >= FIXED_DT_MS) {
			world.update(FIXED_DT_S);
			acc -= FIXED_DT_MS;
		}

		render(world);
		requestAnimationFrame(loop);
	};

	requestAnimationFrame((t) => {
		last = t;
		loop(t);
	});
};
