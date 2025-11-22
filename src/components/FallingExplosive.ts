import { BaseComponent } from "../core";


export class FallingExplosive extends BaseComponent {
	damage: number;
	radius: number;
	constructor(damage: number, radius: number) {
		super();
		this.damage = damage;
		this.radius = radius;
	}
}
