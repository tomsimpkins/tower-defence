import { RequestSpawnEntityCommand } from "../commands/SpawnEntityCommand";
import { BaseSystem, World } from "../core";
import { CELL_SIZE } from "../globals";

export class SpawnEntityInGridSystem extends BaseSystem {
	execute(world: World): void {
		const grid = world.resource.grid;
		const commands2 = world.handleCommands(RequestSpawnEntityCommand);
		for (const { command, positioned } of commands2) {
			const { x, y } = positioned;
			const gx = (x / CELL_SIZE) | 0;
			const gy = (y / CELL_SIZE) | 0;
			if (grid.isOccupied(gx, gy)) {
				continue;
			}

			grid.setTower(gx, gy);
			world.enqueueCommand(command);
		}
	}
}
