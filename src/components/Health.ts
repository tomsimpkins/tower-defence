import { BaseComponent } from "../core";

export class Health extends BaseComponent {
	health: number;
	maxHealth: number;
	constructor(health: number, maxHealth: number = health) {
		super();
		this.health = health;
		this.maxHealth = maxHealth;
	}
}
