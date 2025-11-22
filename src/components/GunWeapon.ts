import { BaseComponent } from "../core";

export class ProjectileWeapon extends BaseComponent {
	kind: "gun" | "mortar";
	damage: number;
	projectileSpeed: number;
	constructor(kind: "gun" | "mortar", damage: number, projectileSpeed: number) {
		super();
		this.kind = kind;
		this.damage = damage;
		this.projectileSpeed = projectileSpeed;
	}
}
