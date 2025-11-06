import { DespawnEntityCommand } from "../commands/DespawnEntityCommand";
import { BaseSystem, type World } from "../core";

export class DespawnEntitySystem extends BaseSystem {
	execute(world: World, dt: number): void {
		for (const { entity } of world.handleCommands(DespawnEntityCommand)) {
			world.destroyEntity(entity);
		}
	}
}
