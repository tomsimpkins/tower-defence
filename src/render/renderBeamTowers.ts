import { BeamWeapon } from "../components/BeamWeapon";
import { MaxRange } from "../components/MaxRange";
import { Positioned } from "../components/Positioned";
import { BeamTowerTag } from "../components/TowerTag";
import type { World } from "../core";
import { TOWER_SIZE } from "../globals";
import { CenterPoint } from "../components/CenterPoint";
import { drawBeamTower } from "./drawBeamTower";

export const renderBeamTowers = (
	world: World,
	ctx: CanvasRenderingContext2D,
) => {
	const towerEntities = world.query(
		BeamTowerTag,
		BeamWeapon,
		Positioned,
		MaxRange,
	);
	for (const towerEntity of towerEntities) {
		const { x, y } = world.mustGetComponent(Positioned, towerEntity);
		const { offsetX, offsetY } = world.mustGetComponent(
			CenterPoint,
			towerEntity,
		);

		const size = TOWER_SIZE;
		drawBeamTower(ctx, x + offsetX, y + offsetY, { size: size });
	}
};
