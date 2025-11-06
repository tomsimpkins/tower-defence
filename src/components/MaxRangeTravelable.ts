import { BaseComponent } from "../core";

export class MaxDistanceTravelable extends BaseComponent {
	distanceLeft: number;
	constructor(distanceLeft: number) {
		super();
		this.distanceLeft = distanceLeft;
	}
}
