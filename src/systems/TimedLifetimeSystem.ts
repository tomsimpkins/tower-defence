import { DespawnEntityCommand } from "../commands/DespawnEntityCommand";
import { TimedLifetime } from "../components/TimedLifetime";
import { BaseSystem, World } from "../core";

export class TimedLifetimeSystem extends BaseSystem {
	execute(world: World, dt: number): void {
		const lifetimes = world.query(TimedLifetime);
		for (const entity of lifetimes) {
			const lifetime = world.mustGetComponent(TimedLifetime, entity);
			lifetime.progress += dt;

			if (lifetime.progress >= lifetime.lifetime) {
				world.enqueueCommand(new DespawnEntityCommand(entity));
			}
		}
	}
}
