import { World, BaseSystem } from "../core";
import { Moving } from "../components/Moving";
import { Positioned } from "../components/Positioned";

export class MoveSystem extends BaseSystem {
	execute(world: World, dt: number): void {
		const flaggedEntities = world.query(Positioned, Moving);

		for (const entity of flaggedEntities) {
			const positioned = world.mustGetComponent<Positioned>(Positioned, entity);
			const moving = world.mustGetComponent<Moving>(Moving, entity);

			positioned.x += moving.vx * dt;
			positioned.y += moving.vy * dt;
		}
	}
}
