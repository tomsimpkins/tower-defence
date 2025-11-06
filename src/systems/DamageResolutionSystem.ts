import { DespawnEntityCommand } from "../commands/DespawnEntityCommand";
import { Health } from "../components/Health";
import { BaseSystem, type World, type EntityId } from "../core";
import { DamageEntityCommand } from "./DamageEntityCommand";

export class DamageResolutionSystem extends BaseSystem {
	execute(world: World): void {
		const killed = new Set<EntityId>();
		for (const { entity, amount } of world.handleCommands(
			DamageEntityCommand,
		)) {
			const health = world.mustGetComponent(Health, entity);
			health.health = Math.max(health.health - amount, 0);

			if (health.health <= 0) {
				killed.add(entity);
			}
		}

		for (const killedEntity of killed) {
			world.enqueueCommand(new DespawnEntityCommand(killedEntity));
		}
	}
}
