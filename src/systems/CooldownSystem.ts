import { Cooldown } from "../components/Cooldown";
import { BaseSystem, World } from "../core";

export class CooldownSystem extends BaseSystem {
	execute(world: World, dt: number): void {
		const cooldownEntities = world.query(Cooldown);
		for (const entity of cooldownEntities) {
			const cooldown = world.mustGetComponent(Cooldown, entity);
			cooldown.cooldownRemaining = Math.max(cooldown.cooldownRemaining - dt, 0);
		}
	}
}
