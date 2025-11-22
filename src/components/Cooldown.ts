import { BaseComponent } from "../core";

export class Cooldown extends BaseComponent {
	cooldownRemaining: number;
	maxCooldown: number;
	constructor(cooldownRemaining: number, maxCooldown: number) {
		super();
		this.cooldownRemaining = cooldownRemaining;
		this.maxCooldown = maxCooldown;
	}
}
