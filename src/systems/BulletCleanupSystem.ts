import { BaseSystem, type World } from "../core";
import { Positioned } from "../components/Positioned";
import { DespawnEntityCommand } from "../commands/DespawnEntityCommand";
import { BulletTag } from "../components/BulletTag";
import { MortarShellTag } from "../components/MortarTag";

export class BulletCleanupSystem extends BaseSystem {
	private margin = 20;

	execute(world: World): void {
		const w = world.resource.map.width;
		const h = world.resource.map.height;

		for (const e of world
			.query(Positioned, BulletTag)
			.concat(world.query(Positioned, MortarShellTag))) {
			const p = world.mustGetComponent<Positioned>(Positioned, e);
			if (
				p.x < -this.margin ||
				p.y < -this.margin ||
				p.x > w + this.margin ||
				p.y > h + this.margin
			) {
				world.enqueueCommand(new DespawnEntityCommand(e));
			}
		}
	}
}
