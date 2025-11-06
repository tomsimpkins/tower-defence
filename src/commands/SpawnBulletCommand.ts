import { BulletTag } from "../components/BulletTag";
import { HitBox } from "../components/Hitbox";
import { MaxDistanceTravelable } from "../components/MaxRangeTravelable";

import { Moving } from "../components/Moving";
import { Positioned } from "../components/Positioned";
import { BULLET_SIZE } from "../globals";

import { SpawnEntityCommand } from "./SpawnEntityCommand";

export const makeSpawnBulletCommand = (
	x: number,
	y: number,
	vx: number,
	vy: number,
	maxRange: number = Infinity,
): SpawnEntityCommand => {
	const bulletBoxSize = BULLET_SIZE * 0.9;
	return SpawnEntityCommand.builder()
		.addComponent(Positioned, new Positioned(x, y))
		.addComponent(Moving, new Moving(vx, vy))
		.addComponent(BulletTag, new BulletTag())
		.addComponent(
			HitBox,
			new HitBox(
				-bulletBoxSize / 2,
				-bulletBoxSize / 2,
				bulletBoxSize,
				bulletBoxSize,
			),
		)
		.addComponent(MaxDistanceTravelable, new MaxDistanceTravelable(maxRange))
		.build();
};
