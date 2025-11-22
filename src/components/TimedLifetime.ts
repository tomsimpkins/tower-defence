import { BaseComponent } from "../core";

export class TimedLifetime extends BaseComponent {
	lifetime: number;
	progress: number;
	constructor(lifetime: number) {
		super();
		this.lifetime = lifetime;
		this.progress = 0;
	}
}
