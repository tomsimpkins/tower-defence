import { DespawnEntityCommand } from "../commands/DespawnEntityCommand";
import { BulletTag } from "../components/BulletTag";
import { Damaging } from "../components/Damaging";
import { HitBox } from "../components/Hitbox";
import { Positioned } from "../components/Positioned";
import { BaseSystem, World } from "../core";
import {  mag, minus } from "../core/point";
import { DamageEntityCommand } from "./DamageEntityCommand";
import { DamageEntitiesInCircleCommand } from "./MortarShellExplosionSystem";

export class BulletEnemyIntersectionSystem extends BaseSystem {
	execute(world: World, dt: number): void {
		const bullets = world.query(BulletTag, HitBox, Positioned, Damaging);
		for (const bullet of bullets) {
			const { x, y } = world.mustGetComponent(Positioned, bullet);
			const { offsetX, offsetY, width, height } = world.mustGetComponent(
				HitBox,
				bullet,
			);
			const { damage } = world.mustGetComponent(Damaging, bullet);

			const intersectedEnemy = world.resource.hitTestMap.intersectsRect(
				x + offsetX,
				y + offsetY,
				width,
				height,
			);

			if (intersectedEnemy !== undefined) {
				world.enqueueCommand(new DamageEntityCommand(intersectedEnemy, damage));
				world.enqueueCommand(new DespawnEntityCommand(bullet));
			}
		}
	}
}

export class DamageEntityInCircleSystem extends BaseSystem {
	execute(world: World, dt: number): void {
		const cmds = world.handleCommands(DamageEntitiesInCircleCommand);
		for (const cmd of cmds) {
			const entityIds = world.resource.hitTestMap.intersectsCircle(
				cmd.x,
				cmd.y,
				cmd.r,
			);

			

			for (const entity of entityIds) {
				const entityPosition = world.mustGetComponent(Positioned, entity)
			const distanceFromCentre = mag(minus(cmd,entityPosition ))
			const proportionalDamage = cmd.damage * Math.max(cmd.r - distanceFromCentre, 0)/cmd.r

				world.enqueueCommand(new DamageEntityCommand(entity, proportionalDamage));
			}
		}
	}
}
