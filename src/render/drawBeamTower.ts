import { TOWER_SIZE } from "../globals";
import {
	type Any2DCanvasContext,
	inBoxN,
	inset,
	roundedRect,
} from "./canvasUtils";
import { makeTowerPalette } from "./makeTowerPalette";

export function drawBeamTower(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	opts: {
		active?: boolean;
		teamColor?: string;
		palette?: Record<string, string>;
		size?: number; // <— NEW: edge length in pixels (default 20)
	} = {},
) {
	const palette = makeTowerPalette(opts.palette || {});
	const team = opts.teamColor || palette.beamAccent;
	const active = !!opts.active;
	const size = Math.max(1, opts.size ?? TOWER_SIZE);

	inBoxN(ctx, x, y, size, 20, () => {
		// All coordinates below are in a normalized 20×20 box at (0,0)
		// Base frame
		inset(
			ctx,
			1,
			1,
			18,
			18,
			4,
			palette.baseFill,
			palette.baseStroke,
			palette.highlight,
		);

		// Emitter block
		inset(
			ctx,
			4,
			4,
			12,
			12,
			3,
			palette.innerFill,
			palette.innerStroke,
			palette.highlight,
		);

		// Emission slit backdrop
		ctx.beginPath();
		ctx.rect(6, 9, 8, 2);
		ctx.fillStyle = palette.slitBg;
		ctx.fill();

		// Glow bar (brighter & wider visually)
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = team;
		ctx.fillRect(7, 9, 6, 2);

		// Soft inner glow hint
		ctx.globalAlpha = 0.25;
		ctx.fillRect(7, 8, 6, 1);
		ctx.globalAlpha = 1;

		// Indicator LED
		ctx.fillStyle = team;
		ctx.fillRect(9, 5, 2, 1);

		// Feet
		ctx.fillStyle = palette.foot;
		ctx.fillRect(3, 16, 3, 1);
		ctx.fillRect(14, 16, 3, 1);

		// Active hint
		if (active) {
			ctx.fillStyle = team;
			ctx.globalAlpha = 0.9;
			ctx.fillRect(9, 2, 2, 2);
			ctx.globalAlpha = 0.45;
			ctx.fillRect(9, 1, 2, 1);
			ctx.globalAlpha = 1;
		}

		// Outer outline
		ctx.strokeStyle = palette.outline;
		ctx.lineWidth = 1; // will be corrected by inBox() to 1px on screen
		roundedRect(ctx, 1, 1, 18, 18, 4);
		ctx.stroke();
	});
}
