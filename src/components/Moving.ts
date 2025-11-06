import { BaseComponent } from "../core";

export class Moving extends BaseComponent {
	vx: number; // units per second
	vy: number;
	constructor(vx: number, vy: number) {
		super();
		this.vx = vx;
		this.vy = vy;
	}
}
