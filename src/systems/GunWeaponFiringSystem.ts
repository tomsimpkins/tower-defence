import { BaseSystem, type World } from "../core";
import { Positioned } from "../components/Positioned";
import { Aim } from "../components/Aim";
import { Cooldown } from "../components/Cooldown";
import { makeSpawnBulletCommand } from "../commands/SpawnBulletCommand";
import { MaxRange } from "../components/MaxRange";
import { TOWER_SIZE } from "../globals";
import { CenterPoint } from "../commands/SpawnEnemyCommand";
import { FireGunTowerCommand } from "./FireGunTowerCommand";

export class GunWeaponFiringSystem extends BaseSystem {
	execute(world: World): void {
		const fireCommands = world.handleCommands(FireGunTowerCommand);

		for (const { tower: towerEntity } of fireCommands) {
			const towerAim = world.mustGetComponent(Aim, towerEntity);
			const towerCooldown = world.mustGetComponent(Cooldown, towerEntity);
			if (towerCooldown.cooldownRemaining > 0) {
				continue;
			}

			const towerMaxRange = world.mustGetComponent(MaxRange, towerEntity);
			const towerPosition = world.mustGetComponent(Positioned, towerEntity);
			const towerCenterPoint = world.mustGetComponent(CenterPoint, towerEntity);
			const bulletSpawnPosition = {
				x: towerPosition.x + towerCenterPoint.offsetX + TOWER_SIZE / 2,
				y: towerPosition.y + towerCenterPoint.offsetY + TOWER_SIZE / 2,
			};

			world.enqueueCommand(
				makeSpawnBulletCommand(
					bulletSpawnPosition.x,
					bulletSpawnPosition.y,
					towerAim.velocity.x,
					towerAim.velocity.y,
					towerMaxRange.range,
				),
			);

			towerCooldown.cooldownRemaining = 0.2;
		}
	}
}
