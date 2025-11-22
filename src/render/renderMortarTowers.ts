import { CenterPoint } from "../components/CenterPoint";
import { Aim } from "../components/Aim";
import { ProjectileWeapon } from "../components/GunWeapon";
import { MaxRange } from "../components/MaxRange";
import { Positioned } from "../components/Positioned";
import { Targeting } from "../components/Targeting";
import { MortarTowerTag } from "../components/TowerTag";
import type { World } from "../core";

import { drawMortarTower } from "./drawMortarTower";

export const renderMortarTowers = (
	world: World,
	ctx: CanvasRenderingContext2D,
) => {
	const towerEntities = world.query(
		CenterPoint,
		MortarTowerTag,
		ProjectileWeapon,
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

		drawMortarTower(ctx, x + offsetX, y + offsetY, {
			angle,
			firing: false,
		});
	}
};
