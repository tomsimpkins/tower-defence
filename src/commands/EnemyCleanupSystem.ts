import { BaseSystem, type World } from "../core";
import { EnemyTag } from "../components/EnemyTag";
import { Positioned } from "../components/Positioned";
import { DespawnEntityCommand } from "./DespawnEntityCommand";
import { CELL_SIZE } from "../globals";

export class EnemyCleanupSystem extends BaseSystem {
	private padding = CELL_SIZE;

	execute(world: World): void {
		const w = world.resource.map.width;
		const h = world.resource.map.height;

		for (const e of world.query(Positioned, EnemyTag)) {
			const p = world.mustGetComponent<Positioned>(Positioned, e);
			if (
				p.x < -this.padding ||
				p.y < -this.padding ||
				p.x > w + this.padding ||
				p.y > h + this.padding
			) {
				world.enqueueCommand(new DespawnEntityCommand(e));
			}
		}
	}
}
