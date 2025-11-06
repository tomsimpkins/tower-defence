import { Targeting } from "../components/Targeting";
import { TowerTag } from "../components/TowerTag";
import { BaseSystem, type World } from "../core";

export class CleanupTargetsSystem extends BaseSystem {
	execute(world: World): void {
		const towers = world.query(TowerTag, Targeting);
		for (const towerEntity of towers) {
			const targeting = world.mustGetComponent(Targeting, towerEntity);
			if (targeting.target === null) {
				continue;
			}

			if (!world.entityIsAlive(targeting.target)) {
				targeting.target = null;
			}
		}
	}
}
