import { BaseComponent } from "../core";

export class Cooldown extends BaseComponent {
	cooldownRemaining: number;
	constructor(cooldownRemaining: number) {
		super();
		this.cooldownRemaining = cooldownRemaining;
	}
}
