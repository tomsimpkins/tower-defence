import { Damaging } from "../components/Damaging";
import { HitBox } from "../components/Hitbox";
import { MaxDistanceTravelable } from "../components/MaxRangeTravelable";
import { MortarShellTag } from "../components/MortarTag";
import { Moving } from "../components/Moving";
import { Positioned } from "../components/Positioned";
import { BULLET_SIZE, GRAVITY } from "../globals";
import { Elevation } from "../components/Elevation";
import { SpawnEntityCommand } from "./SpawnEntityCommand";
import { FallingExplosive } from "../components/FallingExplosive";

export const makeSpawnMortarShellCommand = (
	x: number,
	y: number,
	vx: number,
	vy: number,
	damage: number = 50,
	vz: number = 10,
): SpawnEntityCommand => {
	const bulletBoxSize = BULLET_SIZE * 0.9;
	return SpawnEntityCommand.builder()
		.addComponent(Positioned, new Positioned(x, y))
		.addComponent(Moving, new Moving(vx, vy))
		.addComponent(MortarShellTag, new MortarShellTag())
		.addComponent(FallingExplosive, new FallingExplosive(damage, 22))
		.addComponent(
			HitBox,
			new HitBox(
				-bulletBoxSize / 2,
				-bulletBoxSize / 2,
				bulletBoxSize,
				bulletBoxSize,
			),
		)
		.addComponent(Elevation, new Elevation(0, vz, -(vz * vz) / (2 * GRAVITY)))
		.addComponent(Damaging, new Damaging(damage))
		.build();
};

// 0 = u2 + 2as
// s= -u2/2a
