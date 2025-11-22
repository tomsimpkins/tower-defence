import { BaseSystem, type World } from "../core";
import { Positioned } from "../components/Positioned";
import { Targeting } from "../components/Targeting";
import { BeamTowerTag } from "../components/TowerTag";
import { BeamWeapon } from "../components/BeamWeapon";
import { DamageEntityCommand } from "./DamageEntityCommand";

export class BeamWeaponDamageSystem extends BaseSystem {
	execute(world: World, dt: number): void {
		const towerEntities = world.query(
			Positioned,
			BeamTowerTag,
			BeamWeapon,
			Targeting,
		);

		for (const towerEntity of towerEntities) {
			const nearestEnemy = world.mustGetComponent(
				Targeting,
				towerEntity,
			).target;

			if (nearestEnemy === null) {
				continue;
			}

			const towerWeapon = world.mustGetComponent(BeamWeapon, towerEntity);
			world.enqueueCommand(
				new DamageEntityCommand(nearestEnemy, towerWeapon.damagePerSecond * dt),
			);
		}
	}
}
