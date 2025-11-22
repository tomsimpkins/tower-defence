import { TOWER_SIZE } from "../globals";
import {
	type Any2DCanvasContext,
	inBoxN,
	inset,
	roundedRect,
} from "./canvasUtils";
import { makeTowerPalette } from "./makeTowerPalette";

/**
 * Mortar tower: chunky base + short/fat barrel on an elevation cradle.
 * Angle rotates the whole assembly around the ring center (10,10).
 */
export function drawMortarTower(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	opts: {
		angle?: number;
		firing?: boolean;
		teamColor?: string;
		palette?: Record<string, string>;
		size?: number; // edge length in px (default TOWER_SIZE)
	} = {},
) {
	const palette = makeTowerPalette(opts.palette || {});
	const angle = Number.isFinite(opts.angle) ? Number(opts.angle) : 0;
	const firing = !!opts.firing;
	const team = opts.teamColor || palette.gunAccent;
	const size = Math.max(1, opts.size ?? TOWER_SIZE);

	inBoxN(ctx, x, y, size, 20, () => {
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

		// Turret ring (slightly heavier than gun tower)
		ctx.beginPath();
		ctx.arc(10, 10, 6.25, 0, Math.PI * 2);
		ctx.strokeStyle = palette.ringStroke;
		ctx.lineWidth = 1.25;
		ctx.stroke();

		// Mount + barrel
		ctx.save();
		ctx.translate(10, 10);
		ctx.rotate(angle);

		// Elevation cradle (yoke)
		roundedRect(ctx, -5.5, -4.5, 11, 9, 2.5);
		ctx.fillStyle = palette.innerFill;
		ctx.fill();
		ctx.strokeStyle = palette.innerStroke;
		ctx.lineWidth = 1;
		ctx.stroke();

		// Cradle highlight (top lip)
		ctx.beginPath();
		ctx.moveTo(-4.5, -4.5);
		ctx.lineTo(4.5, -4.5);
		ctx.strokeStyle = palette.highlight;
		ctx.lineWidth = 1;
		ctx.stroke();

		// Support trunnions (side pivots)
		ctx.beginPath();
		ctx.arc(-5.5, 0, 0.9, 0, Math.PI * 2);
		ctx.arc(5.5, 0, 0.9, 0, Math.PI * 2);
		ctx.fillStyle = palette.innerStroke;
		ctx.fill();

		// Fat mortar barrel (team accent on the tube)
		// Tube is short and wide; slight muzzle flare.
		ctx.save();
		ctx.translate(0, -1); // lift tube a touch
		ctx.fillStyle = team;
		roundedRect(ctx, -2.6, -2.6, 8.2, 5.2, 2); // main tube
		ctx.fill();

		// Barrel edge / outline
		ctx.strokeStyle = palette.outline;
		ctx.lineWidth = 1;
		roundedRect(ctx, -2.6, -2.6, 8.2, 5.2, 2);
		ctx.stroke();

		// Breech cap (darker)
		roundedRect(ctx, -4.4, -2, 2.2, 4, 1);
		ctx.fillStyle = palette.slitBg;
		ctx.fill();
		ctx.strokeStyle = palette.innerStroke;
		ctx.lineWidth = 1;
		ctx.stroke();

		// Muzzle ring
		ctx.beginPath();
		ctx.rect(5.2, -2.2, 1.2, 4.4);
		ctx.fillStyle = palette.highlight;
		ctx.globalAlpha = 0.25;
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.restore();

		// Recoil rails (subtle lines under barrel)
		ctx.beginPath();
		ctx.moveTo(-3.6, 3.2);
		ctx.lineTo(3.6, 3.2);
		ctx.strokeStyle = palette.shadow;
		ctx.lineWidth = 1;
		ctx.stroke();

		// Firing effect (short bright puff at muzzle)
		if (firing) {
			ctx.save();
			ctx.translate(6.2, -1); // just ahead of tube tip
			// Central flash
			ctx.fillStyle = team;
			ctx.globalAlpha = 0.9;
			ctx.beginPath();
			ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
			ctx.fill();
			// Outer glow ring
			ctx.strokeStyle = team;
			ctx.globalAlpha = 0.35;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
			ctx.stroke();
			ctx.globalAlpha = 1;
			ctx.restore();
		}

		ctx.restore();

		// Status pip (team color)
		ctx.fillStyle = team;
		ctx.fillRect(3, 3, 2, 2);

		// Feet (wider stance for recoil)
		ctx.fillStyle = palette.foot;
		ctx.fillRect(2, 16, 4, 1);
		ctx.fillRect(14, 16, 4, 1);

		// Outer outline
		ctx.strokeStyle = palette.outline;
		ctx.lineWidth = 1;
		roundedRect(ctx, 1, 1, 18, 18, 4);
		ctx.stroke();
	});
}
