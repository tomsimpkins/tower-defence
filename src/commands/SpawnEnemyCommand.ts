import { EnemyTag } from "../components/EnemyTag";
import { Health } from "../components/Health";
import { HitCircle } from "../components/Hitbox";
import { Moving } from "../components/Moving";
import { Positioned } from "../components/Positioned";
import { type Point } from "../core/point";
import { ENEMY_RADIUS } from "../globals";
import { CenterPoint } from "../components/CenterPoint";

import {
	SpawnEntityCommand,
	type ISpawnEntityCommandBuilder,
} from "./SpawnEntityCommand";

export const makeSpawnEnemyCommand = (
	pos: Point,
	vel: Point,
	health: number
): ISpawnEntityCommandBuilder<SpawnEntityCommand> => {
	const builder = SpawnEntityCommand.builder()
		.addComponent(Positioned, new Positioned(pos.x, pos.y))
		.addComponent(Moving, new Moving(vel.x, vel.y))
		.addComponent(EnemyTag, new EnemyTag())
		.addComponent(Health, new Health(health))
		.addComponent(
			HitCircle,
			new HitCircle(ENEMY_RADIUS, ENEMY_RADIUS, ENEMY_RADIUS),
		)
		.addComponent(CenterPoint, new CenterPoint(ENEMY_RADIUS, ENEMY_RADIUS));

	return builder;
};
