import { DespawnEntityCommand } from "../commands/DespawnEntityCommand";
import { BulletTag } from "../components/BulletTag";
import { EnemyTag } from "../components/EnemyTag";
import { HitBox, HitCircle } from "../components/Hitbox";
import { Positioned } from "../components/Positioned";
import { BaseSystem, World } from "../core";
import { DamageEntityCommand } from "./DamageEntityCommand";

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

		const bullets = world.query(BulletTag, HitBox, Positioned);
		for (const bullet of bullets) {
			const { x, y } = world.mustGetComponent(Positioned, bullet);
			const { offsetX, offsetY, width, height } = world.mustGetComponent(
				HitBox,
				bullet,
			);

			const intersectedEnemy = world.resource.hitTestMap.intersectsRect(
				x + offsetX,
				y + offsetY,
				width,
				height,
			);

			if (intersectedEnemy !== undefined) {
				world.enqueueCommand(new DamageEntityCommand(intersectedEnemy, 50));
				world.enqueueCommand(new DespawnEntityCommand(bullet));
			}
		}
	}
}

//
