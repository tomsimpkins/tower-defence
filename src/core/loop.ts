import { World } from "./world";

const FIXED_DT = 1000 / 60; // timeslice for 60 fps: milliseconds per frame
let last = performance.now(),
	acc = 0;

export const startLoop = (world: World, render: (world: World) => void) => {
	const loop = (now: number) => {
		world.resource.wallTime = now;

		acc += now - last;
		last = now;
		if (acc > 500) acc = 500;
		while (acc >= FIXED_DT) {
			const dt = FIXED_DT / 1000; // dt in seconds
			world.update(dt);

			acc -= FIXED_DT;
		}
		render(world);
		requestAnimationFrame(loop);
	};

	loop(0);
};
