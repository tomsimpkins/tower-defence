import { Aim } from "../components/Aim";
import { Cooldown } from "../components/Cooldown";
import { ProjectileWeapon } from "../components/GunWeapon";
import { MaxRange } from "../components/MaxRange";
import { MinRange } from "../components/MinRange";
import { Positioned } from "../components/Positioned";
import { Targeting } from "../components/Targeting";
import { TargetingMode } from "../components/TargetingMode";
import { MortarTowerTag } from "../components/TowerTag";
import { GRID_SQUARE_SIZE, TOWER_SIZE, WORLD_SCALE } from "../globals";
import { CenterPoint } from "../components/CenterPoint";
import {
	RequestSpawnEntityCommand,
	SpawnEntityCommand,
} from "./SpawnEntityCommand";

export const makeSpawnMortarTowerCommand = (
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
		.addComponent(MortarTowerTag, new MortarTowerTag())
		.addComponent(Targeting, new Targeting())
		.addComponent(ProjectileWeapon, new ProjectileWeapon("mortar", 100, 200))
		.addComponent(MaxRange, new MaxRange(300 * WORLD_SCALE))
		.addComponent(MinRange, new MinRange(TOWER_SIZE / 2))
		.addComponent(TargetingMode, new TargetingMode("closest"))
		.addComponent(Aim, new Aim())
		.addComponent(Cooldown, new Cooldown(0, 3));

	return new RequestSpawnEntityCommand(positioned, builder);
};
