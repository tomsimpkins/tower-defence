import { BaseSystem, type World } from "../core";
import { Positioned } from "../components/Positioned";
import { Aim } from "../components/Aim";
import { Cooldown } from "../components/Cooldown";
import { makeSpawnBulletCommand } from "../commands/SpawnBulletCommand";
import { makeSpawnMortarShellCommand } from "../commands/SpawnMortarShellCommand";
import { MaxRange } from "../components/MaxRange";
import { TOWER_SIZE } from "../globals";
import { CenterPoint } from "../components/CenterPoint";
import { FireProjectileCommand } from "../commands/FireProjectileCommand";
import { ProjectileWeapon } from "../components/GunWeapon";

export class ProjectileWeaponFiringSystem extends BaseSystem {
	execute(world: World): void {
		const fireCommands = world.handleCommands(FireProjectileCommand);

		for (const { tower: towerEntity } of fireCommands) {
			const towerCooldown = world.mustGetComponent(Cooldown, towerEntity);
			if (towerCooldown.cooldownRemaining > 0) {
				continue;
			}

			const towerAim = world.mustGetComponent(Aim, towerEntity);
			const towerProjectileWeapon = world.mustGetComponent(
				ProjectileWeapon,
				towerEntity,
			);
			const towerMaxRange = world.mustGetComponent(MaxRange, towerEntity);
			const towerPosition = world.mustGetComponent(Positioned, towerEntity);
			const towerCenterPoint = world.mustGetComponent(CenterPoint, towerEntity);
			const projectileSpawnPosition = {
				x: towerPosition.x + towerCenterPoint.offsetX + TOWER_SIZE / 2,
				y: towerPosition.y + towerCenterPoint.offsetY + TOWER_SIZE / 2,
			};

			switch (towerProjectileWeapon.kind) {
				case "gun": {
					world.enqueueCommand(
						makeSpawnBulletCommand(
							projectileSpawnPosition.x,
							projectileSpawnPosition.y,
							towerAim.velocity.x,
							towerAim.velocity.y,
							towerMaxRange.range,
							towerProjectileWeapon.damage,
						),
					);
					break;
				}
				case "mortar": {
					world.enqueueCommand(
						makeSpawnMortarShellCommand(
							projectileSpawnPosition.x,
							projectileSpawnPosition.y,
							towerAim.velocity.x,
							towerAim.velocity.y,
							towerProjectileWeapon.damage,
							towerAim.velocity.z,
						),
					);
					break;
				}
			}

			towerCooldown.cooldownRemaining = towerCooldown.maxCooldown;
		}
	}
}
