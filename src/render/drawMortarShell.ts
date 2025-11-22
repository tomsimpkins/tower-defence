import type { Any2DCanvasContext } from "./canvasUtils";
import { inBoxN } from "./canvasUtils";

type PlasmaPalette = Partial<Record<string, string>>;

function makePlasmaPalette(overrides: PlasmaPalette = {}) {
	const p = {
		core: "#c9f7ff", // hot inner core
		glow: "#87e6ff", // main plasma hue (team tint)
		halo: "rgba(135,230,255,0.35)",
		hoop: "#a8f0ff", // containment hoops
		strut: "#4db6d6", // field struts
		outline: "#5a6f93",
		mote: "#b9f1ff", // trailing motes (outer)
		moteHot: "#ffffff", // trailing motes (hot inner)
	};
	return Object.assign(p, overrides);
}

export type PlasmaMortarOpts = {
	angle?: number; // radians; 0 = right
	size?: number; // animate for altitude; default 7
	teamColor?: string; // overrides glow/hoop color
	palette?: Record<string, string>;

	pulse?: number; // 0..1 breathing intensity (you drive this)
	withHoops?: boolean; // containment hoops (default true)
	withStruts?: boolean; // short triangular struts (default true)
	inboxPips?: boolean; // tiny plasma specks inside the 4×4 (default true)
	allowOverflow?: boolean; // comet motes outside the box (default true)
	trailLen?: number; // tune trail strength/length
};

export function drawPlasmaMortarShell(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	opts: PlasmaMortarOpts = {},
) {
	const p = makePlasmaPalette(opts.palette || {});
	const angle = Number.isFinite(opts.angle) ? Number(opts.angle) : 0;
	const size = Math.max(1, opts.size ?? 7);

	const pulse = Math.max(0, Math.min(1, opts.pulse ?? 0)); // expect 0..1
	const withHoops = opts.withHoops ?? true;
	const withStruts = opts.withStruts ?? true;
	const inboxPips = opts.inboxPips ?? true;
	const allowOverflow = opts.allowOverflow ?? true;

	const glow = opts.teamColor || p.glow;
	const hoop = opts.teamColor || p.hoop;

	// Strong, obvious pulse shaping
	const pp = pulse; // linear 0..1
	const p2 = pp * pp; // ease-in to emphasize peaks
	const orbScale = 0.88 + 0.24 * p2; // visibly scales the orb
	const haloR = 1.0 + 0.7 * p2; // larger halo radius
	const haloA = 0.18 + 0.42 * p2; // brighter halo opacity
	const hoopA = 0.35 + 0.55 * pp; // hoops brighten with pulse

	// =============== In-box (4×4) ===============
	inBoxN(ctx, x, y, size, 4, () => {
		ctx.save();
		ctx.translate(2, 2);
		ctx.rotate(angle);

		// Additive blend for plasma parts
		const oldComp = (ctx as any).globalCompositeOperation as string;
		(ctx as any).globalCompositeOperation = "lighter";

		// --- Pulsing orb (scale + layered rings) ---
		ctx.save();
		ctx.translate(0.2, 0);
		ctx.scale(orbScale, orbScale);

		for (let i = 0; i < 3; i++) {
			const r = 0.7 + i * 0.22;
			ctx.beginPath();
			ctx.arc(0, 0, r, 0, Math.PI * 2);
			ctx.fillStyle = i === 0 ? p.core : glow;
			ctx.globalAlpha = i === 0 ? 0.85 + 0.15 * pp : 0.25 + 0.15 * (1 - i) * pp;
			ctx.fill();
		}
		ctx.restore();

		// --- Halo (big additive disc; no shadowBlur so it won't clip) ---
		ctx.globalAlpha = haloA;
		ctx.beginPath();
		ctx.arc(0.2, 0, haloR, 0, Math.PI * 2);
		ctx.fillStyle = glow;
		ctx.fill();
		ctx.globalAlpha = 1;

		// Back to normal blending for hard lines/shapes
		(ctx as any).globalCompositeOperation = oldComp || "source-over";

		// --- Containment hoops (two thin bands that brighten with pulse) ---
		if (withHoops) {
			ctx.strokeStyle = hoop;
			ctx.lineWidth = 0.14;
			ctx.globalAlpha = hoopA;
			ctx.beginPath();
			ctx.ellipse(0.2, 0, 1.05, 0.6, 0, 0, Math.PI * 2);
			ctx.stroke();

			ctx.beginPath();
			ctx.ellipse(0.2, 0, 1.05, 0.6, Math.PI / 3, 0, Math.PI * 2);
			ctx.stroke();
			ctx.globalAlpha = 1;
		}

		// --- Field struts (triangles pointing forward) ---
		if (withStruts) {
			ctx.fillStyle = p.strut;
			// upper strut
			ctx.beginPath();
			ctx.moveTo(-1.2, -0.42);
			ctx.lineTo(-0.45, -0.16);
			ctx.lineTo(-0.95, -0.02);
			ctx.closePath();
			ctx.fill();
			// lower strut
			ctx.beginPath();
			ctx.moveTo(-1.2, 0.42);
			ctx.lineTo(-0.45, 0.16);
			ctx.lineTo(-0.95, 0.02);
			ctx.closePath();
			ctx.fill();
		}

		// --- Subtle in-box plasma specks (distinct from bullet tracer) ---
		if (inboxPips) {
			const prev = (ctx as any).globalCompositeOperation as string;
			(ctx as any).globalCompositeOperation = "lighter";
			ctx.globalAlpha = 0.85;
			ctx.fillStyle = p.moteHot;
			ctx.beginPath();
			ctx.arc(-0.7, 0.05, 0.06, 0, Math.PI * 2);
			ctx.fill();
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = glow;
			ctx.beginPath();
			ctx.arc(-0.95, -0.08, 0.08, 0, Math.PI * 2);
			ctx.fill();
			ctx.globalAlpha = 1;
			(ctx as any).globalCompositeOperation = prev || "source-over";
		}

		// Thin outline to aid readability on bright maps
		ctx.beginPath();
		ctx.arc(0.2, 0, 1.35, 0, Math.PI * 2);
		ctx.strokeStyle = p.outline;
		ctx.lineWidth = 0.1;
		ctx.globalAlpha = 0.5;
		ctx.stroke();
		ctx.globalAlpha = 1;

		ctx.restore();
	});

	// =============== Overflow trail (world space) ===============
	if (allowOverflow) {
		const cos = Math.cos(angle),
			sin = Math.sin(angle);
		const cx = x + size / 2;
		const cy = y + size / 2;

		// Comet-like motes that swirl slightly; feel slow/heavy
		const strength = Math.max(1, opts.trailLen ?? Math.round(size * 1.6));
		const count = Math.max(3, Math.round(0.6 * strength));
		const gap = Math.max(6, Math.round(0.9 * size));

		const oldComp = (ctx as any).globalCompositeOperation as string;
		(ctx as any).globalCompositeOperation = "lighter";

		for (let i = 1; i <= count; i++) {
			const d = i * gap;
			// slight perpendicular swirl
			const swirl = (i % 2 ? 0.18 : -0.18) * (1 + i * 0.1) * (size * 0.2);
			const px = cx - cos * d + -sin * swirl;
			const py = cy - sin * d + cos * swirl;

			const rOuter = Math.max(0.7, size * (0.1 + i * 0.02));
			const rInner = rOuter * 0.45;

			// outer glow mote
			ctx.globalAlpha = Math.max(0.12, 0.45 - i * 0.05);
			ctx.fillStyle = glow;
			ctx.beginPath();
			ctx.arc(px, py, rOuter, 0, Math.PI * 2);
			ctx.fill();

			// hot core
			ctx.globalAlpha *= 1.4;
			ctx.fillStyle = p.moteHot;
			ctx.beginPath();
			ctx.arc(px, py, rInner, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.globalAlpha = 1;
		(ctx as any).globalCompositeOperation = oldComp || "source-over";
	}
}
