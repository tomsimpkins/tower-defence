import { CELL_SIZE } from "../globals";
import { scale, normal } from "../core/point";
import { CenterPoint } from "../components/CenterPoint";
import { FollowWaypoints } from "../components/FollowRoad";
import { Moving } from "../components/Moving";
import { Positioned } from "../components/Positioned";
import { BaseSystem, World } from "../core";

export class FollowWaypointsSystem extends BaseSystem {
	execute(world: World): void {
		for (const entityId of world.query(
			FollowWaypoints,
			Positioned,
			Moving,
			CenterPoint,
		)) {
			const { x, y } = world.mustGetComponent(Positioned, entityId);
			const { offsetX, offsetY } = world.mustGetComponent(
				CenterPoint,
				entityId,
			);
			const entityCentre = { x: x + offsetX, y: y + offsetY };

			const follow = world.mustGetComponent(FollowWaypoints, entityId);
			const currentWaypointCentre = follow.waypoints[follow.waypointIndex];

			const distanceToWaypoint = Math.hypot(
				currentWaypointCentre.x - entityCentre.x,
				currentWaypointCentre.y - entityCentre.y,
			);
			if (distanceToWaypoint > CELL_SIZE / 10) {
				continue;
			}

			const nextWaypointCentre = follow.waypoints[follow.waypointIndex + 1];
			if (!nextWaypointCentre) {
				continue;
			}

			const moving = world.mustGetComponent(Moving, entityId);
			const speed = Math.hypot(moving.vx, moving.vy);

			const nextDirection = {
				x: nextWaypointCentre.x - entityCentre.x,
				y: nextWaypointCentre.y - entityCentre.y,
			};
			const nextVel = scale(speed, normal(nextDirection));

			follow.waypointIndex += 1;
			moving.vx = nextVel.x;
			moving.vy = nextVel.y;
		}
	}
}
