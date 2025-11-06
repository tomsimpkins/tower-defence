import { EnemyTag } from "../components/EnemyTag";
import { Health } from "../components/Health";
import { Moving } from "../components/Moving";
import { Positioned } from "../components/Positioned";
import type { World } from "../core";
import type { Any2DCanvasContext } from "./canvasUtils";
import { ENEMY_RADIUS } from "../globals";
import { withCrisp } from "./canvasUtils";

// =============================
// ENEMIES (minimalist variants)
// =============================

export type EnemyKind = "orb" | "arrow" | "diamond";

export type EnemyOpts = {
	r?: number; // radius; default 5 (your current size)
	kind?: EnemyKind; // "orb" | "arrow" | "diamond"
	angle?: number; // radians; used for "arrow" to point along velocity
	teamColor?: string; // accent/LED color override
	palette?: Record<string, string>;
	damaged?: boolean; // optional: draw a subtle split to imply damage
};

function makeEnemyPalette(overrides: Partial<Record<string, string>> = {}) {
	const p = {
		fill: "#202a3b", // body
		stroke: "#5f77a3", // outline
		rimHi: "rgba(255,255,255,0.12)", // subtle light rim
		led: "#7cd0ff", // indicator LED
		core: "#a9c7ff", // small inner detail for orb
	};
	return Object.assign(p, overrides);
}

/**
 * Draws a minimalist enemy centered at (cx, cy).
 * Default size matches your current circle (r=5).
 * Kinds:
 *   - "orb": ring + inner core (closest to your current circles, just clearer)
 *   - "arrow": tiny triangle that rotates to movement direction
 *   - "diamond": rotated square with outline
 */
function drawEnemy(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	opts: EnemyOpts = {},
	palette = makeEnemyPalette(),
) {
	const r = Math.max(3.5, opts.r ?? 5);
	const cx = x + r;
	const cy = y + r;
	const kind: EnemyKind = opts.kind ?? "orb";
	const angle = Number.isFinite(opts.angle) ? Number(opts.angle) : 0;
	const led = opts.teamColor || palette.led;

	withCrisp(ctx, () => {
		ctx.save();
		ctx.translate(cx, cy);

		// Subtle top-left rim light
		const drawRim = () => {
			ctx.beginPath();
			ctx.arc(-r * 0.4, -r * 0.6, r * 0.15, 0, Math.PI * 2);
			ctx.fillStyle = palette.rimHi;
			ctx.fill();
		};

		if (kind === "orb") {
			// Body
			ctx.beginPath();
			ctx.arc(0, 0, r, 0, Math.PI * 2);
			ctx.fillStyle = palette.fill;
			ctx.fill();
			ctx.strokeStyle = palette.stroke;
			ctx.lineWidth = 1;
			ctx.stroke();

			// Inner core
			ctx.beginPath();
			ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
			ctx.fillStyle = palette.core;
			ctx.globalAlpha = 0.85;
			ctx.fill();
			ctx.globalAlpha = 1;

			// LED
			ctx.beginPath();
			ctx.arc(r * 0.4, -r * 0.2, r * 0.18, 0, Math.PI * 2);
			ctx.fillStyle = led;
			ctx.fill();

			if (opts.damaged) {
				// Tiny split line
				ctx.beginPath();
				ctx.moveTo(-r * 0.6, r * 0.2);
				ctx.lineTo(r * 0.2, -r * 0.4);
				ctx.strokeStyle = palette.stroke;
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			drawRim();
		}

		if (kind === "arrow") {
			ctx.rotate(angle);
			// Tiny triangle; fits within ~diameter of previous circle
			ctx.beginPath();
			ctx.moveTo(r, 0);
			ctx.lineTo(-r * 0.6, -r * 0.7);
			ctx.lineTo(-r * 0.6, r * 0.7);
			ctx.closePath();
			ctx.fillStyle = palette.fill;
			ctx.fill();
			ctx.strokeStyle = palette.stroke;
			ctx.lineWidth = 1;
			ctx.stroke();

			// LED at “nose”
			ctx.beginPath();
			ctx.arc(r * 0.55, 0, r * 0.18, 0, Math.PI * 2);
			ctx.fillStyle = led;
			ctx.fill();

			drawRim();
		}

		if (kind === "diamond") {
			ctx.rotate(Math.PI / 4);
			const s = r * Math.SQRT2; // so the diamond fits similar radius
			ctx.beginPath();
			ctx.rect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4);
			ctx.fillStyle = palette.fill;
			ctx.fill();
			ctx.strokeStyle = palette.stroke;
			ctx.lineWidth = 1;
			ctx.stroke();

			// LED near top
			ctx.beginPath();
			ctx.arc(0, -s * 0.55, r * 0.18, 0, Math.PI * 2);
			ctx.fillStyle = led;
			ctx.fill();

			drawRim();
		}

		ctx.restore();
	});
}

// =============================
// EXAMPLES / USAGE
// =============================

// Start a beam from a beam tower:
// const { sx, sy } = beamStartFromTower(towerX, towerY);
// drawBeam(ctx, sx, sy, enemyX, enemyY, {
//   width: 2,
//   dash: true,
//   dashOffset: time * 12,  // animate
//   impact: true
// });

// Minimal enemies (centered coordinates):
// drawEnemy(ctx, ex, ey, { kind: "orb",   r: 5 });                // default orb
// drawEnemy(ctx, ex, ey, { kind: "arrow", r: 5, angle: theta });  // points along velocity
// drawEnemy(ctx, ex, ey, { kind: "diamond", r: 5 });              // alt shape

const radToDeg = (rad: number) => {
	const radPositive = (rad + 2 * Math.PI) % (2 * Math.PI);
	return ((radPositive * 180) / Math.PI) | 0;
};
const degToRad = (n: number) => (n * Math.PI) / 180;

const ENEMY_CELL_PADDING = 5;
const ENEMY_SIZE = 2 * ENEMY_RADIUS;
const ENEMY_CELL_SIZE = ENEMY_SIZE + 2 * ENEMY_CELL_PADDING;
const ENEMY_KIND_OPTIONS = 3;
const DAMAGE_OPTIONS = 2;
const DEGREE_OPTIONS = 360;
const offscreenCanvas = new OffscreenCanvas(
	DEGREE_OPTIONS * ENEMY_CELL_SIZE,
	ENEMY_KIND_OPTIONS * DAMAGE_OPTIONS * ENEMY_CELL_SIZE,
);

const offscreenCtx = offscreenCanvas.getContext("2d")!;
const getIndex2 = (
	enemyKind: EnemyKind,
	damaged: boolean,
	angleDeg: number,
): [x: number, y: number] => {
	const enemyKindIndices: Record<EnemyKind, number> = {
		arrow: 0,
		diamond: 1,
		orb: 2,
	};

	return [
		angleDeg,
		enemyKindIndices[enemyKind] * DAMAGE_OPTIONS + Number(damaged),
	];
};

const predrawEnemy = (ctx: Any2DCanvasContext) => {
	for (const enemyKind of ["arrow", "orb", "diamond"] as EnemyKind[]) {
		for (const damaged of [true, false]) {
			for (let deg = 0; deg < 360; deg++) {
				const [ix, iy] = getIndex2(enemyKind, damaged, deg);
				drawEnemy(
					ctx,
					ix * ENEMY_CELL_SIZE + ENEMY_CELL_PADDING,
					iy * ENEMY_CELL_SIZE + ENEMY_CELL_PADDING,
					{
						damaged,
						kind: enemyKind,
						angle: degToRad(deg),
						teamColor: "red",
						r: ENEMY_RADIUS,
					},
				);
			}
		}
	}
};

const drawFromCache = (
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	opt: { damaged?: boolean; kind?: EnemyKind; angle?: number },
) => {
	const damaged = Boolean(opt.damaged);
	const angle = radToDeg(opt.angle ?? 0);
	const kind = opt.kind ?? "orb";

	const [ix, iy] = getIndex2(kind, damaged, angle);

	ctx.drawImage(
		offscreenCanvas,
		ix * ENEMY_CELL_SIZE + ENEMY_CELL_PADDING,
		iy * ENEMY_CELL_SIZE + ENEMY_CELL_PADDING,
		ENEMY_SIZE,
		ENEMY_SIZE,
		cx,
		cy,
		ENEMY_SIZE,
		ENEMY_SIZE,
	);
};

predrawEnemy(offscreenCtx);

export const renderEnemies = (world: World, ctx: CanvasRenderingContext2D) => {
	const enemies = world.query(EnemyTag, Positioned, Moving, Health);
	for (let i = enemies.length - 1; i >= 0; i--) {
		const enemyEntity = enemies[i];
		const position = world.mustGetComponent<Positioned>(
			Positioned,
			enemyEntity,
		);
		const health = world.mustGetComponent(Health, enemyEntity);
		const damaged = health.health / health.maxHealth < 0.5;
		const moving = world.mustGetComponent(Moving, enemyEntity);
		const deg = Math.atan2(moving.vy, moving.vx);

		drawFromCache(ctx, position.x, position.y, {
			damaged,
			kind: "orb",
			angle: deg,
		});
	}
};
