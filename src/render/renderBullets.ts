import { BulletTag } from "../components/BulletTag";

import { Moving } from "../components/Moving";
import { Positioned } from "../components/Positioned";
import type { World } from "../core";
import type { Any2DCanvasContext } from "./canvasUtils";
import { BULLET_SIZE } from "../globals";
import { inBoxN } from "./canvasUtils";

// Capsule helper (centered at 0,0, axis-aligned to X, caller rotates/positions)
function drawCapsule(
	ctx: Any2DCanvasContext,
	w: number,
	h: number,
	radius: number,
	fill: string,
	stroke?: string,
) {
	const rw = Math.max(0, Math.min(radius, h / 2));
	const rx = w / 2,
		ry = h / 2;

	ctx.beginPath();
	// Left semicircle
	ctx.arc(-rx + rw, 0, rw, Math.PI / 2, Math.PI * 1.5);
	// Top edge to right
	ctx.lineTo(rx - rw, -ry);
	// Right semicircle
	ctx.arc(rx - rw, 0, rw, Math.PI * 1.5, Math.PI / 2);
	// Bottom edge back to left
	ctx.lineTo(-rx + rw, ry);
	ctx.closePath();

	ctx.fillStyle = fill;
	ctx.fill();
	if (stroke) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = 1;
		ctx.stroke();
	}
}

// ===== Palette for bullets (harmonizes with your tower palette) =====
function makeBulletPalette(overrides: Partial<Record<string, string>> = {}) {
	const p = {
		core: "#eaf3ff", // bullet body
		outline: "#6d82a8", // thin outline to read on dark
		tracer: "#a8d6ff", // short in-box tracer
		tracerHot: "#ffffff", // little hot core in tracer
		allowOverflowTracer: "#a8d6ff", // used only when allowOverflow = true
	};
	return Object.assign(p, overrides);
}

/**
 * Scalable minimalist bullet. Draws inside a normalized 4×4 box at (x, y),
 * then scales to `size`. Uses your existing makeBulletPalette & drawCapsule.
 */
function drawBullet(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	opts: BulletOpts = {},
) {
	const p = makeBulletPalette(opts.palette || {});
	const angle = Number.isFinite(opts.angle) ? Number(opts.angle) : 0;
	const size = Math.max(1, opts.size ?? 4);
	const coreFill = opts.teamColor || p.core;

	// --- Draw the bullet itself inside a scaled 4×4 box ---
	inBoxN(ctx, x, y, size, 4, () => {
		ctx.save();
		// center of 4×4
		ctx.translate(2, 2);
		ctx.rotate(angle);

		// Optional short tracer (stays within the 4×4 bounds)
		if (opts.tracer) {
			ctx.beginPath();
			ctx.moveTo(-1.8, 0);
			ctx.lineTo(-0.2, 0);
			ctx.strokeStyle = p.tracer;
			ctx.lineWidth = 1;
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(-1.2, 0);
			ctx.lineTo(-0.6, 0);
			ctx.strokeStyle = p.tracerHot;
			ctx.lineWidth = 1;
			ctx.globalAlpha = 0.9;
			ctx.stroke();
			ctx.globalAlpha = 1;
		}

		// Body capsule (fits inside 4×4 at any rotation)
		// width 3.0, height 1.6, radius 0.8
		drawCapsule(ctx, 3.0, 1.6, 0.8, coreFill, p.outline);

		ctx.restore();
	});

	// --- Optional long trail that extends outside the bullet box (world space) ---
	if (opts.allowOverflow) {
		const cos = Math.cos(angle),
			sin = Math.sin(angle);
		const cx = x + size / 2;
		const cy = y + size / 2;

		// Trail length scales with bullet size for consistent look
		const L = TRACER_LENGTH;

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(cx - cos * L, cy - sin * L);
		ctx.lineTo(cx - cos * (size * 0.4), cy - sin * (size * 0.4));
		ctx.strokeStyle = p.allowOverflowTracer;
		ctx.lineWidth = 1;
		ctx.globalAlpha = 0.55;
		ctx.stroke();
		ctx.globalAlpha = 1;
		ctx.restore();
	}
}

const radToDeg = (rad: number) => {
	const radPositive = (rad + 2 * Math.PI) % (2 * Math.PI);
	return ((radPositive * 180) / Math.PI) | 0;
};
const degToRad = (n: number) => (n * Math.PI) / 180;

const TRACER_LENGTH = Math.ceil(Math.max(8, BULLET_SIZE * 2.5));
const FRAME_SIZE = BULLET_SIZE + 2 * TRACER_LENGTH;
const offscreenCanvas = new OffscreenCanvas(360 * FRAME_SIZE, FRAME_SIZE);
const offscreenCtx = offscreenCanvas.getContext("2d")!;
const prerenderBullets = (ctx: Any2DCanvasContext) => {
	for (let deg = 0; deg < 360; deg++) {
		drawBullet(ctx, deg * FRAME_SIZE + TRACER_LENGTH, TRACER_LENGTH, {
			angle: degToRad(deg),
			tracer: true,
			allowOverflow: true,
			size: BULLET_SIZE,
		});
	}
};
prerenderBullets(offscreenCtx);

const drawFromCache = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	opt: { angle: number },
) => {
	const angle = radToDeg(opt.angle ?? 0);
	ctx.drawImage(
		offscreenCanvas,
		angle * FRAME_SIZE,
		0,
		FRAME_SIZE,
		FRAME_SIZE,
		x - FRAME_SIZE / 2,
		y - FRAME_SIZE / 2,
		FRAME_SIZE,
		FRAME_SIZE,
	);
};

export const renderBullets = (world: World, ctx: CanvasRenderingContext2D) => {
	const bulletEntities = world.query(BulletTag, Positioned, Moving);
	for (const bulletEntity of bulletEntities) {
		const { x, y } = world.mustGetComponent(Positioned, bulletEntity);
		const { vx, vy } = world.mustGetComponent(Moving, bulletEntity);

		const angle = Math.atan2(vy, vx);
		drawFromCache(ctx, x, y, { angle });
	}
};

export type BulletOpts = {
	angle?: number; // radians; 0 = right
	teamColor?: string; // accent override
	palette?: Record<string, string>;
	tracer?: boolean; // short in-box tracer
	allowOverflow?: boolean; // long trail outside the box
	size?: number; // <— NEW: bullet edge length in pixels (default 4)
};
