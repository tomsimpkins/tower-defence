import { BaseSystem, World } from "../core";
import { GRAVITY } from "../globals";
import { Elevation } from "../components/Elevation";

export class ElevationSystem extends BaseSystem {
	execute(world: World, dt: number): void {
		const elevatedEntities = world.query(Elevation);
		for (const entity of elevatedEntities) {
			const elevation = world.mustGetComponent(Elevation, entity);

			elevation.z += elevation.vz * dt;
			elevation.vz += GRAVITY * dt;
		}
	}
}
