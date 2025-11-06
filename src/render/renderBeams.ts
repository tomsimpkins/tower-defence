import { BeamWeapon } from "../components/BeamWeapon";
import { Positioned } from "../components/Positioned";
import { Targeting } from "../components/Targeting";
import { TowerTag } from "../components/TowerTag";
import type { World } from "../core";

import { CELL_SIZE, ENEMY_SIZE, TOWER_SIZE } from "../globals";
import { withCrisp } from "./canvasUtils";

type BeamOpts = {
	color?: string; // main beam color (default pairs with your beam tower)
	width?: number; // core line width (px), default 2
	glow?: number; // extra glow thickness multiplier, default 3x core
	dash?: boolean; // add a faint dashed highlight
	dashOffset?: number; // animate by incrementing this each frame
	impact?: boolean; // draw a small minimalist impact marker at the target
	impactSize?: number; // size (px) of the impact marker, default 4
	alpha?: number; // global alpha for the beam, default 1
};

const makeBeamPalette = (overrides: Partial<Record<string, string>> = {}) => {
	const p = {
		beam: "#87e6ff", // matches your beam tower accent
		glow1: "rgba(135,230,255,0.35)",
		glow2: "rgba(135,230,255,0.18)",
		dash: "rgba(255,255,255,0.65)",
		impactCore: "#eaf8ff",
		impactRing: "rgba(135,230,255,0.7)",
	} as const;
	return Object.assign(p, overrides);
};

/**
 * Minimalist beam: soft outer glow + crisp core + optional dashed highlight and impact.
 * Starts at (sx, sy), ends at (tx, ty). Does not modify global canvas state outside.
 */
function drawBeam(
	ctx: CanvasRenderingContext2D,
	sx: number,
	sy: number,
	tx: number,
	ty: number,
	opts: BeamOpts = {},
	palette = makeBeamPalette(),
) {
	const color = opts.color || palette.beam;
	const coreW = Math.max(1, opts.width ?? 2);
	const glowMul = Math.max(1.5, opts.glow ?? 3);
	const alpha = opts.alpha ?? 1;

	withCrisp(ctx, () => {
		ctx.save();
		ctx.globalAlpha = alpha;

		// Vector
		const dx = tx - sx;
		const dy = ty - sy;
		const len = Math.hypot(dx, dy) || 1;
		const nx = dx / len;
		const ny = dy / len;

		// --- Outer glow (two passes) ---
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		ctx.beginPath();
		ctx.moveTo(sx, sy);
		ctx.lineTo(tx, ty);
		ctx.strokeStyle = palette.glow2;
		ctx.lineWidth = coreW * (glowMul + 1.5);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(sx, sy);
		ctx.lineTo(tx, ty);
		ctx.strokeStyle = palette.glow1;
		ctx.lineWidth = coreW * glowMul;
		ctx.stroke();

		// --- Core ---
		ctx.beginPath();
		ctx.moveTo(sx, sy);
		ctx.lineTo(tx, ty);
		ctx.strokeStyle = color;
		ctx.lineWidth = coreW;
		ctx.stroke();

		// --- Faint dashed highlight along the beam (optional) ---
		if (opts.dash) {
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(sx, sy);
			ctx.lineTo(tx, ty);
			ctx.setLineDash([4, 6]); // minimalist, sparse
			ctx.lineDashOffset = -(opts.dashOffset ?? 0);
			ctx.strokeStyle = palette.dash;
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.restore();
		}

		// --- Minimalist impact marker (optional) ---
		if (opts.impact) {
			const s = Math.max(2, opts.impactSize ?? 4);
			ctx.save();
			ctx.translate(tx, ty);
			// Little diamond
			ctx.rotate(Math.PI / 4);
			ctx.beginPath();
			ctx.rect(-s * 0.5, -s * 0.5, s, s);
			ctx.strokeStyle = palette.impactRing;
			ctx.lineWidth = 1;
			ctx.stroke();

			// Hot core dot slightly offset back along the beam normal so it doesn't overdraw too bright
			ctx.beginPath();
			ctx.arc(-nx * 0.6, -ny * 0.6, 0.8, 0, Math.PI * 2);
			ctx.fillStyle = palette.impactCore;
			ctx.fill();
			ctx.restore();
		}

		ctx.restore();
	});
}

export const renderBeams = (world: World, ctx: CanvasRenderingContext2D) => {
	const towers = world.query(TowerTag, BeamWeapon, Targeting);
	for (const tower of towers) {
		const { target: targetEnemy } = world.mustGetComponent(Targeting, tower);

		if (targetEnemy === null) {
			continue;
		}

		const { x, y } = world.mustGetComponent(Positioned, tower);
		const { x: tx, y: ty } = world.mustGetComponent(Positioned, targetEnemy);
		const m = (CELL_SIZE - ENEMY_SIZE) / 2;
		drawBeam(ctx, x + TOWER_SIZE / 2, y + TOWER_SIZE / 2, tx + m, ty + m);
	}
};
