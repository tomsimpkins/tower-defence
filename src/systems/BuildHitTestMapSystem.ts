import { EnemyTag } from "../components/EnemyTag";
import { HitCircle } from "../components/Hitbox";
import { Positioned } from "../components/Positioned";
import { BaseSystem, World } from "../core";

export class BuildHitTestMapSystem extends BaseSystem {
	execute(world: World): void {
		world.resource.hitTestMap.clear();

		const enemies = world.query(EnemyTag, HitCircle, Positioned);
		for (const enemy of enemies) {
			const { offsetX, offsetY, radius } = world.mustGetComponent(
				HitCircle,
				enemy,
			);
			const { x, y } = world.mustGetComponent(Positioned, enemy);
			world.resource.hitTestMap.addCircle(
				enemy,
				x + offsetX,
				y + offsetY,
				radius,
			);
		}
	}
}
