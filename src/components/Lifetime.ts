import { BaseComponent } from "../core";

export class Lifetime extends BaseComponent {
	lifetime: number;
	constructor(lifetime: number = Infinity) {
		super();
		this.lifetime = lifetime;
	}
}
