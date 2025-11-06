import { BaseComponent } from "../core";

export class BeamWeapon extends BaseComponent {
	damagePerSecond: number;
	constructor(damagePerSecond: number) {
		super();
		this.damagePerSecond = damagePerSecond;
	}
}
