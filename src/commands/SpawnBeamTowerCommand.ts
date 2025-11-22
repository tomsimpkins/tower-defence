import { Targeting } from "../components/Targeting";
import { Positioned } from "../components/Positioned";
import { BeamTowerTag } from "../components/TowerTag";
import { BeamWeapon } from "../components/BeamWeapon";
import { MaxRange } from "../components/MaxRange";
import { MinRange } from "../components/MinRange";
import { TargetingMode } from "../components/TargetingMode";
import {
	RequestSpawnEntityCommand,
	SpawnEntityCommand,
} from "./SpawnEntityCommand";
import { GRID_SQUARE_SIZE, TOWER_SIZE, WORLD_SCALE } from "../globals";
import { CenterPoint } from "../components/CenterPoint";

export const makeSpawnBeamTowerCommand = (
	x: number,
	y: number,
): RequestSpawnEntityCommand => {
	const positioned = new Positioned(
		Math.floor(x / GRID_SQUARE_SIZE) * GRID_SQUARE_SIZE,
		Math.floor(y / GRID_SQUARE_SIZE) * GRID_SQUARE_SIZE,
	);

	const padding = (GRID_SQUARE_SIZE - TOWER_SIZE) / 2;

	const builder = SpawnEntityCommand.builder()
		.addComponent(CenterPoint, new CenterPoint(padding, padding))
		.addComponent(BeamTowerTag, new BeamTowerTag())
		.addComponent(Targeting, new Targeting())
		.addComponent(BeamWeapon, new BeamWeapon(40))
		.addComponent(MaxRange, new MaxRange(300 * WORLD_SCALE))
		.addComponent(MinRange, new MinRange(0))
		.addComponent(TargetingMode, new TargetingMode("closest"));

	return new RequestSpawnEntityCommand(positioned, builder);
};
