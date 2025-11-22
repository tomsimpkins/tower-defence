import { Positioned } from "../components/Positioned";
import { TimedLifetime } from "../components/TimedLifetime";
import type { World } from "../core";
import { ExplosionTag } from "../systems/MortarShellExplosionSystem";
import type { Any2DCanvasContext } from "./canvasUtils";

/** Palette tuned to your plasma mortar. */
function makePlasmaExplosionPalette(
	overrides: Partial<Record<string, string>> = {},
) {
	const p = {
		core: "#c9f7ff",
		glow: "#87e6ff",
		halo: "rgba(135,230,255,0.35)",
		mote: "#b9f1ff",
		moteHot: "#ffffff",
		outline: "rgba(90,111,147,0.5)",
	};
	return Object.assign(p, overrides);
}

export type PlasmaExplosionOpts = {
	/** Progress in [0..1]; 0 = fully expanded, 1 = fully faded. */
	t: number;

	/** Max world radius in px (start radius). */
	maxRadius?: number; // default 22

	/** Team tint; overrides glow hue. */
	teamColor?: string;

	/** Optional palette overrides. */
	palette?: Record<string, string>;

	/** How many motes to emit (roughly). */
	moteCount?: number; // default 10

	/** Seed angle to decorrelate multiple explosions. */
	seedAngle?: number; // default 0

	/** If true, draw a thin outline ring to help readability. */
	outline?: boolean; // default true
};

/**
 * Draws a contracting plasma explosion at (x,y).
 * t in [0..1] controls contraction & fade (0 = max, 1 = gone).
 */
export function drawPlasmaExplosion(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	opts: PlasmaExplosionOpts,
) {
	// ---- parameters & shaping ----
	const p = makePlasmaExplosionPalette(opts.palette || {});
	const t = Math.max(0, Math.min(1, opts.t));
	const R0 = Math.max(2, opts.maxRadius ?? 22);
	const hue = opts.teamColor || p.glow;
	const outlineOn = opts.outline ?? true;

	// Ease so it lingers large, then collapses quickly near the end.
	const easeOut = (u: number) => 1 - Math.pow(1 - u, 2.1);
	const k = easeOut(t); // 0..1
	const R = R0 * (1 - k); // contracting radius
	const coreR = Math.max(0, R * 0.45);
	const midR = Math.max(0, R * 0.75);
	const haloR = Math.max(0, R * (1.05 + 0.15 * (1 - k))); // slight breathing

	// Alpha envelope: bright at start, fades to 0 by end
	const alpha = Math.max(0, 1 - t * 1.1);

	// Contracting shock ring (starts outside and rushes inward)
	const ringR = R0 * (0.95 - 0.8 * k);
	const ringA = Math.max(0, 0.45 * (1 - k));

	// Motes drift inward (implosive vibe) with a little swirl
	const N = Math.max(0, opts.moteCount ?? 10);
	const seed = opts.seedAngle ?? 0;

	// ---- draw ----
	ctx.save();

	// Additive for glow layers
	const prevComp = (ctx as any).globalCompositeOperation as string;
	(ctx as any).globalCompositeOperation = "lighter";

	// HALO
	if (haloR > 0 && alpha > 0) {
		ctx.globalAlpha = alpha * 0.35;
		ctx.beginPath();
		ctx.arc(x, y, haloR, 0, Math.PI * 2);
		ctx.fillStyle = hue;
		ctx.fill();
	}

	// MID GLOW
	if (midR > 0 && alpha > 0) {
		ctx.globalAlpha = alpha * 0.55;
		ctx.beginPath();
		ctx.arc(x, y, midR, 0, Math.PI * 2);
		ctx.fillStyle = hue;
		ctx.fill();
	}

	// CORE (hot)
	if (coreR > 0 && alpha > 0) {
		ctx.globalAlpha = Math.min(1, alpha * 0.9);
		ctx.beginPath();
		ctx.arc(x, y, coreR, 0, Math.PI * 2);
		ctx.fillStyle = p.core;
		ctx.fill();
	}

	// SHOCK RING (contracting)
	if (ringR > 0 && ringA > 0) {
		ctx.globalAlpha = ringA;
		ctx.lineWidth = Math.max(1, R0 * 0.05 * (1 - k));
		ctx.strokeStyle = hue;
		ctx.beginPath();
		ctx.arc(x, y, ringR, 0, Math.PI * 2);
		ctx.stroke();
	}

	// MOTES (imploding)
	if (N > 0 && alpha > 0) {
		for (let i = 0; i < N; i++) {
			// base angle spread
			const a = seed + (i / N) * Math.PI * 2;
			// distance contracts from outer edge toward center
			const d0 = R0 * (0.6 + 0.35 * Math.sin(i * 12.9898)); // pseudo-random start
			const d = d0 * (1 - k * (0.85 + 0.1 * Math.cos(i * 7.233)));
			// subtle swirl perpendicular to the radius
			const swirl = (1 - k) * 4 * Math.sin(i * 5.1);
			const px = x + Math.cos(a) * d + Math.cos(a + Math.PI / 2) * swirl;
			const py = y + Math.sin(a) * d + Math.sin(a + Math.PI / 2) * swirl;

			// Outer mote
			ctx.globalAlpha = alpha * 0.35;
			ctx.beginPath();
			ctx.arc(px, py, Math.max(0.7, R0 * 0.06 * (1 - k)), 0, Math.PI * 2);
			ctx.fillStyle = p.mote;
			ctx.fill();

			// Hot inner mote
			ctx.globalAlpha = alpha * 0.55;
			ctx.beginPath();
			ctx.arc(px, py, Math.max(0.4, R0 * 0.03 * (1 - k)), 0, Math.PI * 2);
			ctx.fillStyle = p.moteHot;
			ctx.fill();
		}
	}

	// Back to normal comp before outline
	(ctx as any).globalCompositeOperation = prevComp || "source-over";

	// Thin outline to keep readability on bright backgrounds (optional)
	if (outlineOn && R > 0 && alpha > 0.05) {
		ctx.globalAlpha = alpha * 0.4;
		ctx.lineWidth = 1;
		ctx.strokeStyle = p.outline;
		ctx.beginPath();
		ctx.arc(x, y, R, 0, Math.PI * 2);
		ctx.stroke();
	}

	// reset
	ctx.globalAlpha = 1;
	ctx.restore();
}

export const renderPlasmaExplosions = (
	world: World,
	ctx: Any2DCanvasContext,
) => {
	const explosions = world.query(ExplosionTag, Positioned, TimedLifetime);
	for (const explosion of explosions) {
		const positioned = world.mustGetComponent(Positioned, explosion);
		const lifetime = world.mustGetComponent(TimedLifetime, explosion);
		const exp = world.mustGetComponent(ExplosionTag, explosion)
		const t = lifetime.progress / lifetime.lifetime;

		drawPlasmaExplosion(ctx, positioned.x, positioned.y, { t, maxRadius: exp.radius });
	}
};
