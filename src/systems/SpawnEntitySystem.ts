import { BaseSystem, type World } from "../core";
import { SpawnEntityCommand } from "../commands/SpawnEntityCommand";

export class SpawnEntitySystem extends BaseSystem {
	execute(world: World): void {
		const commands2 = world.handleCommands(SpawnEntityCommand);
		for (const { components } of commands2) {
			const entityId = world.createEntity();
			for (const [type, data] of components) {
				world.addComponent(entityId, type, data);
			}
		}
	}
}
