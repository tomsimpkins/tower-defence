import { BaseComponent } from "../core";

export class GunWeapon extends BaseComponent {
	damage: number;
	projectileSpeed: number;
	constructor(damage: number, projectileSpeed: number) {
		super();
		this.damage = damage;
		this.projectileSpeed = projectileSpeed;
	}
}
