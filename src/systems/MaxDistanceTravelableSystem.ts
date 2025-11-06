import { DespawnEntityCommand } from "../commands/DespawnEntityCommand";
import { MaxDistanceTravelable } from "../components/MaxRangeTravelable";
import { Moving } from "../components/Moving";
import { BaseSystem, World } from "../core";

export class MaxDistanceTravelableSystem extends BaseSystem {
	execute(world: World, dt: number): void {
		const entities = world.query(MaxDistanceTravelable, Moving);
		for (const entity of entities) {
			const maxDistance = world.mustGetComponent(MaxDistanceTravelable, entity);
			const { vx, vy } = world.mustGetComponent(Moving, entity);
			const speed = Math.hypot(vx, vy);
			const distanceTravelled = dt * speed;
			maxDistance.distanceLeft = Math.max(
				maxDistance.distanceLeft - distanceTravelled,
				0,
			);

			if (maxDistance.distanceLeft <= 0) {
				world.enqueueCommand(new DespawnEntityCommand(entity));
			}
		}
	}
}
