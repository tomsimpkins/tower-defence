import { Elevation } from "../components/Elevation";
import { MortarShellTag } from "../components/MortarTag";
import { Moving } from "../components/Moving";
import { Positioned } from "../components/Positioned";
import type { World } from "../core";
import { BULLET_SIZE } from "../globals";
import { drawPlasmaMortarShell as drawMortarShell } from "./drawMortarShell";

export const renderMortarShells = (
	world: World,
	ctx: CanvasRenderingContext2D,
) => {
	const mortarShells = world.query(MortarShellTag, Positioned, Moving);
	for (const mortarShell of mortarShells) {
		const { x, y } = world.mustGetComponent(Positioned, mortarShell);
		const { vx, vy } = world.mustGetComponent(Moving, mortarShell);
		const { z, maxZ } = world.mustGetComponent(Elevation, mortarShell);
		

		const angle = Math.atan2(vy, vx);
		drawMortarShell(ctx, x, y, {
			angle,
			inboxPips: true,
			withHoops: true,
			allowOverflow: true,
			size: BULLET_SIZE + (z / maxZ) * BULLET_SIZE,
			pulse: 0.5 * (Math.sin(world.resource.ui.wallTime / 50) + 1),
			withStruts: true,
			trailLen: 5,
		});
	}
};
