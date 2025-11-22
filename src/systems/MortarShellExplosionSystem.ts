import { Positioned } from "./../components/Positioned";
import { DespawnEntityCommand } from "../commands/DespawnEntityCommand";
import { SpawnEntityCommand } from "../commands/SpawnEntityCommand";
import { Elevation } from "../components/Elevation";


import { BaseCommand, BaseComponent, BaseSystem, World } from "../core";
import { TimedLifetime } from "../components/TimedLifetime";

import { FallingExplosive } from "../components/FallingExplosive";

export class ExplosionTag extends BaseComponent {
	radius: number
	constructor(radius: number) {
		super()
		this.radius=radius
	}
}

const makeSpawnExplosionCommand = (x: number, y: number,r:number) => {
	return SpawnEntityCommand.builder()
		.addComponent(ExplosionTag, new ExplosionTag(r))
		.addComponent(Positioned, new Positioned(x, y))
		.addComponent(TimedLifetime, new TimedLifetime(2))
		.build();
};

export class DamageEntitiesInCircleCommand extends BaseCommand {
	x: number;
	y: number;
	r: number;
	damage: number
	constructor(x: number, y: number, r: number, damage: number) {
		super();

		this.x = x;
		this.y = y;
		this.r = r;
		this.damage=damage
	}
}

export class MortarShellExplosionSystem extends BaseSystem {
	execute(world: World, dt: number): void {
		const explosives = world.query(
			FallingExplosive,
			Elevation,
			Positioned,
		);
		for (const explosive of explosives) {
			const elevation = world.mustGetComponent(Elevation, explosive);
			if (elevation.z > 0) {
				continue;
			}

			const fallingExplosive = world.mustGetComponent(FallingExplosive, explosive)
			const positioned = world.mustGetComponent(Positioned, explosive);

			world.enqueueCommand(
				makeSpawnExplosionCommand(positioned.x, positioned.y,fallingExplosive.radius),
			);
			world.enqueueCommand(
				new DamageEntitiesInCircleCommand(positioned.x, positioned.y, fallingExplosive.radius, fallingExplosive.damage),
			);
			world.enqueueCommand(new DespawnEntityCommand(explosive));
		}
	}
}
