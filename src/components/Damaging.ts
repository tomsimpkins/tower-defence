import { BaseComponent } from "../core";

export class Damaging extends BaseComponent {
	damage: number;
	constructor(damage: number) {
		super();
		this.damage = damage;
	}
}
