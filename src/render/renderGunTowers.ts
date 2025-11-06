import { CenterPoint } from "../commands/SpawnEnemyCommand";
import { Aim } from "../components/Aim";
import { GunWeapon } from "../components/GunWeapon";
import { MaxRange } from "../components/MaxRange";
import { Positioned } from "../components/Positioned";
import { TowerTag } from "../components/TowerTag";
import type { World } from "../core";
import { TOWER_SIZE } from "../globals";
import {
	type Any2DCanvasContext,
	inBoxN,
	inset,
	roundedRect,
} from "./canvasUtils";
import { makeTowerPalette } from "./makeTowerPalette";

export function drawGunTower(
	ctx: Any2DCanvasContext,
	x: number,
	y: number,
	opts: {
		angle?: number;
		firing?: boolean;
		teamColor?: string;
		palette?: Record<string, string>;
		size?: number; // <— NEW: edge length in pixels (default 20)
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

		// Turret ring (lighter stroke for readability)
		ctx.beginPath();
		ctx.arc(10, 10, 6, 0, Math.PI * 2);
		ctx.strokeStyle = palette.ringStroke;
		ctx.lineWidth = 1;
		ctx.stroke();

		// Turret assembly
		ctx.save();
		ctx.translate(10, 10);
		ctx.rotate(angle);

		// Body
		roundedRect(ctx, -4, -3, 8, 6, 2);
		ctx.fillStyle = palette.innerFill;
		ctx.fill();
		ctx.strokeStyle = palette.innerStroke;
		ctx.lineWidth = 1;
		ctx.stroke();

		// Body highlight (subtle top edge)
		ctx.beginPath();
		ctx.moveTo(-3, -3);
		ctx.lineTo(3, -3);
		ctx.strokeStyle = palette.highlight;
		ctx.lineWidth = 1;
		ctx.stroke();

		// Barrel (accent)
		ctx.fillStyle = team;
		ctx.fillRect(3, -1, 6, 2); // 6px barrel
		ctx.globalAlpha = 0.95;
		ctx.fillRect(9, -1, 1, 2); // muzzle cap
		ctx.globalAlpha = 1;

		// Firing flash
		if (firing) {
			ctx.globalAlpha = 0.65;
			ctx.fillRect(10, -1, 1, 2);
			ctx.globalAlpha = 1;
		}

		ctx.restore();

		// Status pip
		ctx.fillStyle = team;
		ctx.fillRect(3, 3, 2, 2);

		// Feet
		ctx.fillStyle = palette.foot;
		ctx.fillRect(3, 16, 3, 1);
		ctx.fillRect(14, 16, 3, 1);

		// Outer outline
		ctx.strokeStyle = palette.outline;
		ctx.lineWidth = 1;
		roundedRect(ctx, 1, 1, 18, 18, 4);
		ctx.stroke();
	});
}

export const renderGunTowers = (
	world: World,
	ctx: CanvasRenderingContext2D,
) => {
	const towerEntities = world.query(
		CenterPoint,
		TowerTag,
		GunWeapon,
		Positioned,
		MaxRange,
		Aim,
	);
	for (const towerEntity of towerEntities) {
		const { x, y } = world.mustGetComponent(Positioned, towerEntity);
		const { offsetX, offsetY } = world.mustGetComponent(
			CenterPoint,
			towerEntity,
		);
		const { velocity } = world.mustGetComponent(Aim, towerEntity);

		const angle = velocity ? Math.atan2(velocity.y, velocity.x) : undefined;

		drawGunTower(ctx, x + offsetX, y + offsetY, {
			angle,
			firing: false,
		});
	}
};
