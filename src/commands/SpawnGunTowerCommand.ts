import { Targeting } from "../components/Targeting";
import { Positioned } from "../components/Positioned";
import { TowerTag } from "../components/TowerTag";
import { MaxRange } from "../components/MaxRange";
import { MinRange } from "../components/MinRange";
import { TargetingMode } from "../components/TargetingMode";
import { GunWeapon } from "../components/GunWeapon";
import { Aim } from "../components/Aim";
import { Cooldown } from "../components/Cooldown";
import {
	RequestSpawnEntityCommand,
	SpawnEntityCommand,
} from "./SpawnEntityCommand";
import { GRID_SQUARE_SIZE, TOWER_SIZE, WORLD_SCALE } from "../globals";
import { CenterPoint } from "./SpawnEnemyCommand";

export const makeSpawnGunTowerCommand = (
	x: number,
	y: number,
): RequestSpawnEntityCommand => {
	const positioned = new Positioned(
		Math.floor(x / GRID_SQUARE_SIZE) * GRID_SQUARE_SIZE,
		Math.floor(y / GRID_SQUARE_SIZE) * GRID_SQUARE_SIZE,
	);

	const padding = (GRID_SQUARE_SIZE - TOWER_SIZE) / 2;

	const builder = SpawnEntityCommand.builder()
		.addComponent(Positioned, positioned)
		.addComponent(CenterPoint, new CenterPoint(padding, padding))
		.addComponent(TowerTag, new TowerTag())
		.addComponent(Targeting, new Targeting())
		.addComponent(GunWeapon, new GunWeapon(1, 300))
		.addComponent(MaxRange, new MaxRange(300 * WORLD_SCALE))
		.addComponent(MinRange, new MinRange(TOWER_SIZE / 2))
		.addComponent(TargetingMode, new TargetingMode("closest"))
		.addComponent(Aim, new Aim())
		.addComponent(Cooldown, new Cooldown(0));

	return new RequestSpawnEntityCommand(positioned, builder);
};
