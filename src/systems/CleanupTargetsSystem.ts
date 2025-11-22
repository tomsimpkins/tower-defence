import { Targeting } from "../components/Targeting";
import { BaseSystem, type World } from "../core";

export class CleanupTargetsSystem extends BaseSystem {
	execute(world: World): void {
		const entities = world.query(Targeting);
		for (const entity of entities) {
			const targeting = world.mustGetComponent(Targeting, entity);
			if (targeting.target === null) {
				continue;
			}

			if (!world.entityIsAlive(targeting.target)) {
				targeting.target = null;
			}
		}
	}
}
