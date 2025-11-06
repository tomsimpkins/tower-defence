import { BaseComponent } from "../core";
import type { Point } from "../core/point";

export class FollowWaypoints extends BaseComponent {
	waypointIndex: number = 0;
	waypoints: Point[];
	constructor(waypoints: Point[]) {
		super();
		this.waypoints = waypoints;
	}
}
