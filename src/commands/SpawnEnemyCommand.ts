import { EnemyTag } from "../components/EnemyTag";
import { Health } from "../components/Health";
import { HitCircle } from "../components/Hitbox";
import { Moving } from "../components/Moving";
import { Positioned } from "../components/Positioned";
import { BaseComponent } from "../core";
import { type Point } from "../core/point";
import { ENEMY_RADIUS, ENEMY_SIZE } from "../globals";

class DrawDimensions extends BaseComponent {
	w: number;
	h: number;
	constructor(offsetX: number, offsetY: number, w: number, h: number) {
		super();
		this.w = w;
		this.h = h;
	}
}

export class CenterPoint extends BaseComponent {
	offsetX: number;
	offsetY: number;
	constructor(offsetX: number, offsetY: number) {
		super();
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}
}

import {
	SpawnEntityCommand,
	type ISpawnEntityCommandBuilder,
} from "./SpawnEntityCommand";

export const makeSpawnEnemyCommand = (
	pos: Point,
	vel: Point,
): ISpawnEntityCommandBuilder<SpawnEntityCommand> => {
	const builder = SpawnEntityCommand.builder()
		.addComponent(Positioned, new Positioned(pos.x, pos.y))
		.addComponent(Moving, new Moving(vel.x, vel.y))
		.addComponent(EnemyTag, new EnemyTag())
		.addComponent(Health, new Health(100))
		.addComponent(
			HitCircle,
			new HitCircle(ENEMY_RADIUS, ENEMY_RADIUS, ENEMY_RADIUS),
		)
		.addComponent(CenterPoint, new CenterPoint(ENEMY_RADIUS, ENEMY_RADIUS));

	return builder;
};
