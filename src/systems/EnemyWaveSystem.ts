import { makeSpawnEnemyCommand } from "../commands/SpawnEnemyCommand";
import { FollowWaypoints } from "../components/FollowRoad";
import { BaseSystem, World } from "../core";
import { addPoints, scale } from "../core/point";
import { CELL_SIZE, ENEMY_SIZE } from "../globals";

export class EnemyWaveSystem extends BaseSystem {
	private every = 0.3; // every 50ms
	private acc = 0;
	execute(world: World, dt: number): void {
		this.acc += dt;
		if (this.acc < this.every) {
			return;
		}
		this.acc = 0;

		const enemiesToCreate = 1;
		const road = world.resource.road;
		const roadStart = road.points[0];

		const roadNext = road.points[1];

		const margin = (CELL_SIZE - ENEMY_SIZE) / 2;
		const pos = addPoints(world.gridToWorld(roadStart), {
			x: margin,
			y: margin,
		});

		const dirX = Math.sign(roadNext.x - roadStart.x);
		const dirY = Math.sign(roadNext.y - roadStart.y);
		const vel = scale(50, { x: dirX, y: dirY });
		const corners = road.waypoints.map((corner) => addPoints(world.gridToWorld(corner), {
			x: CELL_SIZE / 2,
			y: CELL_SIZE / 2,
		})
		);

		for (let i = 0; i < enemiesToCreate; i++) {
			world.enqueueCommand(
				makeSpawnEnemyCommand(pos, vel, 500)
					.addComponent(FollowWaypoints, new FollowWaypoints(corners))
					.build()
			);
		}
	}
}
